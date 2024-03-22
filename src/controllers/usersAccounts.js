const bcrypt = require("bcryptjs");
const passport = require("passport");
const uuid = require("uuid");
const { Op } = require("sequelize");

require("dotenv").config();

const Blog = require("../models/Blog");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const Like = require("../models/Like");
const BlogAccount = require("../models/BlogAccount");
const Token = require("../models/Token");

const { uploadProfileImage, deleteImage } = require("../utils/cloudinary");

const fsExtra = require("fs-extra");

const {
  validateId,
  validateFileType,
  validatePassword,
  validateEmail,
  validatePasswordConfirmation,
  validateImageSize,
  validateName,
  validateText,
  validateTitle,
} = require("../utils/index");

const usersAccountsServices = require("../services/usersAccounts");
const notificationsServices = require("../services/notifications");
const emailsServices = require("../services/emails");

// Create new user account
const createAccount = async (req, res, next) => {
  const { email, password, password2 } = req.body;
  try {
    // Validations
    if (validateEmail(email)) {
      return res.status(400).json({
        statusCode: 400,
        msg: validateEmail(email),
      });
    }

    const emailExist = await usersAccountsServices.checkEmailExists(email);

    if (emailExist) {
      return res.status(400).json({
        statusCode: 400,
        msg: `Email "${email}" exists! Try with another one!`,
      });
    }

    if (validatePassword(password)) {
      return res.status(400).json({
        statusCode: 400,
        msg: validatePassword(password),
      });
    }

    if (validatePasswordConfirmation(password, password2)) {
      return res.status(400).json({
        statusCode: 400,
        msg: validatePasswordConfirmation(password, password2),
      });
    }

    // Hash Password
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        if (err) {
          return next("Error trying to create a new account");
        }
        try {
          const accountCreated = await usersAccountsServices.createAccount(
            hash,
            email
          );

          if (accountCreated) {
            const account = await usersAccountsServices.getAccountById(
              accountCreated.id
            );

            const url = `${process.env.URL}/api/users/account/${account.id}/verify`;

            //await emailsServices.sendEmailVerification(url, account.email);

            await notificationsServices.createNotification(
              account.id,
              "Your account was created successfully!"
            );

            return res.status(201).json({
              statusCode: 201,
              data: account,
              msg: "Account created successfully!",
            });
          }
        } catch (error) {
          console.log(error.message);
          return next("Error trying to create a new account");
        }
      });
    });
  } catch (error) {
    console.log(error);
    return next("Error trying to create a new account");
  }
};

// Google Callback
const googleCallback = async (req, res, next) => {
  if (req.user) {
    const accountFound = await usersAccountsServices.getAccountById(
      req.user.id
    );

    if (accountFound.isBanned === true) {
      return res.status(400).json({
        statusCode: 400,
        msg: "This account is banned! Please contact the admin of the page...",
      });
    }

    if (accountFound.isVerified === false) {
      return res.status(400).json({
        statusCode: 400,
        msg: "Please verify your account!",
      });
    }

    return res.status(200).json({
      statusCode: 200,
      msg: "You logged in successfully",
      data: accountFound,
    });
  } else {
    return next("Error trying to authenticate with Google");
  }
};

// Github Callback
const githubCallback = async (req, res, next) => {
  if (req.user) {
    const accountFound = await usersAccountsServices.getAccountById(
      req.user.id
    );

    if (accountFound.isBanned === true) {
      return res.status(400).json({
        statusCode: 400,
        msg: "This account is banned! Please contact the admin of the page...",
      });
    }

    if (accountFound.isVerified === false) {
      return res.status(400).json({
        statusCode: 400,
        msg: "Please verify your account!",
      });
    }

    return res.status(200).json({
      statusCode: 200,
      msg: "You logged in successfully",
      data: accountFound,
    });
  } else {
    return next("Error trying to authenticate with Google");
  }
};

// Verify Account
const verifyAccount = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!validateId(id)) {
      return res.status(400).json({
        statusCode: 400,
        msg: `ID: ${id} - Invalid format!`,
      });
    }

    const accountFound = await usersAccountsServices.getAccountById(id);

    if (!accountFound) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Account with ID: ${id} not found!`,
      });
    }

    if (accountFound.isBanned === true) {
      return res.status(400).json({
        statusCode: 400,
        msg: "This account is banned! You can not verify it...",
      });
    }

    if (accountFound.isVerified === true) {
      return res.status(400).json({
        statusCode: 400,
        msg: "This account is already verified!",
      });
    }

    const updatedAccount = await usersAccountsServices.updateIsVerifiedAccount(
      id
    );

    if (updatedAccount) {
      return res.status(200).json({
        statusCode: 200,
        msg: "Your account is now verified!",
        data: updatedAccount,
      });
    }
  } catch (error) {
    return next(error);
  }
};

// Update username
const updateUsername = async (req, res, next) => {
  const { value } = req.query;

  try {
    if (!value) {
      return res.status(400).json({
        statusCode: 400,
        msg: "Query parameter is missing!",
      });
    }

    if (value.length < 4) {
      return res.status(400).json({
        statusCode: 400,
        msg: "Username must be at least 4 characters long!",
      });
    }

    const usernameExist = await usersAccountsServices.checkUsernameExists(
      value.split(" ").join("")
    );

    if (usernameExist) {
      return res.status(400).json({
        statusCode: 400,
        msg: `Username "${value}" exists! Try with another one!`,
      });
    }

    const updatedAccount = await usersAccountsServices.updateUsername(
      req.user.id,
      `@${value.toLowerCase().split(" ").join("")}`
    );

    if (updatedAccount) {
      await notificationsServices.createNotification(
        req.user.id,
        "Your username was updated successfully!"
      );

      return res.status(200).json({
        statusCode: 200,
        msg: "Your username was updated successfully!",
        data: updatedAccount,
      });
    }
  } catch (error) {
    console.log(error);
    return next("Error trying to update user account username");
  }
};

// Update user image
const updateUserImage = async (req, res, next) => {
  try {
    if (req.files?.image) {
      if (await validateFileType(req.files.image.tempFilePath)) {
        const message = await validateFileType(req.files.image.tempFilePath);

        await fsExtra.unlink(req.files.image.tempFilePath);

        return res.status(400).json({
          statusCode: 400,
          msg: message,
        });
      }

      if (await validateImageSize(req.files.image.tempFilePath)) {
        const message = await validateImageSize(req.files.image.tempFilePath);

        await fsExtra.unlink(req.files.image.tempFilePath);

        return res.status(400).json({
          statusCode: 400,
          msg: message,
        });
      }

      const result = await uploadProfileImage(req.files.image.tempFilePath);

      await fsExtra.unlink(req.files.image.tempFilePath);

      const userUpdated = await usersAccountsServices.updateUserImage(
        req.user.id,
        result.secure_url,
        result.public_id
      );

      await notificationsServices.createNotification(
        req.user.id,
        "Your profile image was updated successfully!"
      );

      return res.status(200).json({
        statusCode: 200,
        msg: "Your profile image was updated successfully!",
        data: userUpdated,
      });
    } else {
      return res.status(400).json({
        statusCode: 400,
        msg: "Image file is missing!",
      });
    }
  } catch (error) {
    await fsExtra.unlink(req.files.image.tempFilePath);
    console.log(error.message);
    return next(error);
  }
};

// Delete user image
const deleteUserImage = async (req, res, next) => {
  try {
    const account = await usersAccountsServices.deleteUserImage(req.user.id);

    if (account === null) {
      return res.status(400).json({
        statusCode: 400,
        msg: "You do not have a profile image to delete!",
      });
    }

    return res.status(200).json({
      statusCode: 200,
      msg: "Profile image deleted successfully!",
      data: account,
    });
  } catch (error) {
    console.log(error.message);
    return next("Error trying to delete profile account user image");
  }
};

// Delete account
const deleteAccount = async (req, res, next) => {
  try {
    const account = await usersAccountsServices.deleteUserAccount(req.user.id);

    if (account) {
      req.logout((err) => {
        if (err) return next(err);
        return res.status(200).json({
          statusCode: 200,
          msg: "Account deleted successfully!",
        });
      });
    }
  } catch (error) {
    console.log(error.message);
    return next("Error trying to delete user account");
  }
};

module.exports = {
  createAccount,
  googleCallback,
  githubCallback,
  verifyAccount,
  updateUsername,
  updateUserImage,
  deleteUserImage,
  deleteAccount,
};
