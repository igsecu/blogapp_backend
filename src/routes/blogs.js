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

// Create new user account
router.post("/account", async (req, res, next) => {
  const { email, password, password2, username } = req.body;
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

    if (validateUsername(username)) {
      return res.status(400).json({
        statusCode: 400,
        msg: validateUsername(username),
      });
    }

    const usernameExist = await BlogAccount.findOne({
      where: {
        username: {
          [Op.iLike]: `${username}`,
        },
      },
    });

    if (usernameExist) {
      return res.status(400).json({
        statusCode: 400,
        msg: `Username "${username}" exists! Try with another one!`,
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
            username,
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

module.exports = router;
