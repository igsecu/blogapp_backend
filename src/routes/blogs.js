const express = require("express");
const router = express.Router();

const Blog = require("../models/Blog");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const Like = require("../models/Like");
const BlogAccount = require("../models/BlogAccount");

const { uploadProfileImage, deleteImage } = require("../utils/cloudinary");

const {
  validateId,
  validateFileType,
  validatePassword,
  validateEmail,
  validatePasswordConfirmation,
  validateUsername,
} = require("../utils/index");

const { getBlogAccountById } = require("../controllers/blogs");

const bcrypt = require("bcryptjs");

const { Op } = require("sequelize");

const passport = require("passport");

// Google Callback
router.get(
  "/auth/google/callback",
  passport.authenticate("google"),
  async (req, res, next) => {
    if (req.user) {
      const accountFound = await getBlogAccountById(req.user.id);
      return res.status(200).json({
        statusCode: 200,
        data: accountFound,
      });
    } else {
      return next("Error trying to authenticate with Google");
    }
  }
);

// Google Authentication
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Get Logged in account
router.get("/account", async (req, res) => {
  if (req.user) {
    const blogAccount = await getBlogAccountById(req.user.id);
    return res.status(200).json({
      statusCode: 200,
      data: blogAccount,
    });
  } else {
    return res.status(400).json({
      statusCode: 400,
      msg: `No Blog Account logged in`,
    });
  }
});

// Logout Process
router.get("/logout", (req, res, next) => {
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
});

// Login route
router.post("/login", async (req, res, next) => {
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
});

// Create new user account
router.post("/account", async (req, res, next) => {
  const { email, password, password2 } = req.body;
  try {
    // Validations
    if (validateEmail(email)) {
      return res.status(400).json({
        statusCode: 400,
        msg: validateEmail(email),
      });
    }

    const emailExist = await BlogAccount.findOne({
      where: {
        email,
      },
    });

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
          const accountCreated = await BlogAccount.create({
            password: hash,
            email,
            type: "LOCAL",
          });

          if (accountCreated) {
            const account = await getBlogAccountById(accountCreated.id);

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
    return next("Error trying to create a new account");
  }
});

/*     if (validateUsername(username)) {
      return res.status(400).json({
        statusCode: 400,
        msg: validateUsername(username),
      });
    }

    const usernameExist = await BlogAccount.findOne({
      where: {
        username: {
          [Op.iLike]: `@${username}`,
        },
      },
    });

    if (usernameExist) {
      return res.status(400).json({
        statusCode: 400,
        msg: `Username "${username}" exists! Try with another one!`,
      });
    } */

// username: `@${username.toLowerCase()}`,

module.exports = router;
