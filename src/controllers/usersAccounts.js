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

const {
  uploadPostImage,
  uploadProfileImage,
  deleteImage,
} = require("../utils/cloudinary");

const {
  validateId,
  validateFileType,
  validatePassword,
  validateEmail,
  validatePasswordConfirmation,
  ensureAuthenticatedUser,
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

// Create new user account from Github or Google
const createAccountFromGithubOrGoogle = async (req, res, next) => {
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
          const accountCreated =
            await usersAccountsServices.createAccountFromGithubOrGoogle(
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

// Login process
const login = async (req, res, next) => {
  if (req.user) {
    return res.status(400).json({
      statusCode: 400,
      msg: "An user is already logged in!",
    });
  }

  const { email, password } = req.body;

  if (validateEmail(email)) {
    return res.status(400).json({
      statusCode: 400,
      msg: validateEmail(email),
    });
  }

  if (!password) {
    return res.status(400).json({
      statusCode: 400,
      msg: "Password is missing",
    });
  }

  passport.authenticate("local", (error, user, info) => {
    if (error) {
      return next(error);
    }
    if (!user) {
      if (info.statusCode === 400) {
        return res.status(400).json({
          statusCode: info.statusCode,
          msg: info.msg,
        });
      }
      return res.status(404).json({
        statusCode: info.statusCode,
        msg: info.msg,
      });
    }
    req.logIn(user, (error) => {
      if (error) {
        console.log(error.message);
        return next(error);
      }
      return res.status(200).json({
        statusCode: 200,
        msg: "You logged in successfully",
      });
    });
  })(req, res, next);
};

// Get logged in account
const getLoggedInAccount = async (req, res, next) => {
  if (req.user && req.user.isAdmin === false) {
    const blogAccount = await usersAccountsServices.getAccountById(req.user.id);
    return res.status(200).json({
      statusCode: 200,
      data: blogAccount,
    });
  } else {
    return res.status(400).json({
      statusCode: 400,
      msg: `No User Account logged in`,
    });
  }
};

// Logout process
const logout = async (req, res, next) => {
  if (!req.user) {
    return res.status(400).json({
      statusCode: 400,
      msg: `No user logged in`,
    });
  }
  req.logout((err) => {
    if (err) return next(err);

    return res.status(200).json({
      statusCode: 200,
      msg: "You successfully logged out!",
    });
  });
};

module.exports = {
  createAccount,
  login,
  getLoggedInAccount,
  logout,
  createAccountFromGithubOrGoogle,
};
