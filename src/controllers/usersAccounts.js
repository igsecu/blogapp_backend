const bcrypt = require("bcryptjs");

require("dotenv").config();

const { uploadProfileImage } = require("../utils/cloudinary");

const fsExtra = require("fs-extra");

const {
  validateId,
  validateFileType,
  validatePassword,
  validateEmail,
  validatePasswordConfirmation,
  validateImageSize,
  validatePage,
  validateLimit,
} = require("../utils/index");

const usersAccountsServices = require("../services/usersAccounts");
const notificationsServices = require("../services/notifications");
const emailsServices = require("../services/emails");
const tokenServices = require("../services/token");

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

            await emailsServices.sendEmailVerification(url, account.email);

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

// Request Password
const requestPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    if (validateEmail(email)) {
      return res.status(400).json({
        statusCode: 400,
        msg: validateEmail(email),
      });
    }

    const emailExist = await usersAccountsServices.checkEmailExists(email);

    if (!emailExist) {
      return res.status(404).json({
        statusCode: 404,
        msg: `No user account with email: ${email} exists!`,
      });
    }

    if (emailExist.dataValues.isBanned === true) {
      return res.status(400).json({
        statusCode: 400,
        msg: "This account is banned! You can not reset your password...",
      });
    }

    if (emailExist.dataValues.isVerified === false) {
      return res.status(400).json({
        statusCode: 400,
        msg: "Please verify your account before reseting your password!",
      });
    }

    const tokenExist = await tokenServices.tokenExists(
      emailExist.dataValues.id
    );

    if (tokenExist) {
      await tokenServices.deleteToken(tokenExist.dataValues.id);
    }

    const newToken = await tokenServices.createToken(emailExist.dataValues.id);

    const url = `${process.env.URL}/account/reset/password?token=${newToken.token}&accountId=${emailExist.dataValues.id}`;

    await emailsServices.sendEmailRequestPassword(url, email);

    return res.status(200).json({
      statusCode: 200,
      msg: "Check your email to reset your password!",
      token: newToken,
      accountId: emailExist.dataValues.id,
    });
  } catch (error) {
    return next("Error sending link to reset password");
  }
};

// Reset Password
const resetPassword = async (req, res, next) => {
  const { token, accountId, password, password2 } = req.body;

  try {
    if (!accountId) {
      return res.status(400).json({
        statusCode: 400,
        msg: "accountId is missing",
      });
    }

    if (!validateId(accountId)) {
      return res.status(400).json({
        statusCode: 400,
        msg: `accountId: ${accountId} - Invalid format!`,
      });
    }

    const account = await usersAccountsServices.getAccountById(accountId);

    if (!account) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Account with ID: ${accountId} not found!`,
      });
    }

    if (account.isBanned === true) {
      return res.status(400).json({
        statusCode: 400,
        msg: "This account is banned! You can not reset its password...",
      });
    }

    if (!token) {
      return res.status(400).json({
        statusCode: 400,
        msg: "Token is missing",
      });
    }

    const tokenExists = await tokenServices.tokenExists(accountId);

    if (!tokenExists) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Token for the account: ${accountId} not found!`,
      });
    }

    if (tokenExists.dataValues.token !== token.token) {
      return res.status(400).json({
        statusCode: 400,
        msg: "Invalid token!",
      });
    }

    if (tokenServices.checkIfExpires(tokenExists)) {
      return res.status(400).json({
        statusCode: 400,
        msg: "Token time expired!",
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
          return next("Error trying to reset password");
        }
        try {
          const updatedAccount = await usersAccountsServices.updatePassword(
            accountId,
            hash
          );

          if (updatedAccount) {
            await emailsServices.sendEmailPasswordConfirmation(
              updatedAccount.email
            );

            await tokenServices.deleteToken(token.id);

            return res.status(200).json({
              statusCode: 200,
              data: account,
              msg: "Password reseted successfully!",
            });
          }
        } catch (error) {
          console.log(error.message);
          return next("Error trying to reset user account password");
        }
      });
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

// Get all accounts
const getAccounts = async (req, res, next) => {
  const { page, limit } = req.query;
  try {
    if (page) {
      if (validatePage(page)) {
        return res.status(400).json({
          statusCode: 400,
          msg: "Page must be a number",
        });
      }

      if (parseInt(page) === 0) {
        return res.status(404).json({
          statusCode: 404,
          msg: `Page ${page} not found!`,
        });
      }
    }

    if (limit) {
      if (validateLimit(limit)) {
        return res.status(400).json({
          statusCode: 400,
          msg: "Limit must be a number",
        });
      }
    }

    const accounts = await usersAccountsServices.getAccounts(
      req.user.id,
      page ? page : 1,
      limit ? limit : 10
    );

    if (!accounts) {
      return res.status(404).json({
        statusCode: 404,
        msg: "No accounts saved in DB",
      });
    }

    if (!accounts.data.length) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Page ${page} not found!`,
      });
    }

    res.status(200).json({
      statusCode: 200,
      ...accounts,
    });
  } catch (error) {
    next(error);
  }
};

// Get filtered accounts
const getFilteredAccounts = async (req, res, next) => {
  const { text, page, limit } = req.query;
  try {
    if (!text) {
      return res.status(400).json({
        statusCode: 400,
        msg: "Text query parameter is missing",
      });
    }

    if (page) {
      if (validatePage(page)) {
        return res.status(400).json({
          statusCode: 400,
          msg: "Page must be a number",
        });
      }

      if (parseInt(page) === 0) {
        return res.status(404).json({
          statusCode: 404,
          msg: `Page ${page} not found!`,
        });
      }
    }

    if (limit) {
      if (validateLimit(limit)) {
        return res.status(400).json({
          statusCode: 400,
          msg: "Limit must be a number",
        });
      }
    }

    const accounts = await usersAccountsServices.getFilteredAccounts(
      req.user.id,
      text,
      page ? page : 1,
      limit ? limit : 10
    );

    if (!accounts) {
      return res.status(404).json({
        statusCode: 404,
        msg: `No accounts with text: ${text} found!`,
      });
    }

    if (!accounts.data.length) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Page ${page} not found!`,
      });
    }

    res.status(200).json({
      statusCode: 200,
      ...accounts,
    });
  } catch (error) {
    next(error);
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
  requestPassword,
  resetPassword,
  getAccounts,
  getFilteredAccounts,
};
