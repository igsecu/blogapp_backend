const express = require("express");
const router = express.Router();

const Blog = require("../models/Blog");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const Like = require("../models/Like");
const BlogAccount = require("../models/BlogAccount");

const { uploadProfileImage, deleteImage } = require("../utils/cloudinary");
const fsExtra = require("fs-extra");
const fileUpload = require("express-fileupload");

const {
  validateId,
  validateFileType,
  validatePassword,
  validateEmail,
  validatePasswordConfirmation,
  validateUsername,
  ensureAuthenticatedAdmin,
  ensureAuthenticatedUser,
  validateImageSize,
} = require("../utils/index");

const {
  getBlogAccountById,
  updateUserImage,
  updateUsername,
} = require("../controllers/blogs");

const bcrypt = require("bcryptjs");

const { Op } = require("sequelize");

const passport = require("passport");

require("dotenv").config();

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Github Callback
router.get(
  "/auth/github/callback",
  passport.authenticate("github"),
  async (req, res, next) => {
    if (req.user) {
      const accountFound = await getBlogAccountById(req.user.id);
      return res.status(200).json({
        statusCode: 200,
        msg: "You logged in successfully",
        data: accountFound,
      });
    } else {
      return next("Error trying to authenticate with Google");
    }
  }
);

// Github Authentication
router.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

// Google Callback
router.get(
  "/auth/google/callback",
  passport.authenticate("google"),
  async (req, res, next) => {
    if (req.user) {
      const accountFound = await getBlogAccountById(req.user.id);
      return res.status(200).json({
        statusCode: 200,
        msg: "You logged in successfully",
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
  if (req.user && req.user.isAdmin === false) {
    const blogAccount = await getBlogAccountById(req.user.id);
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

            const url = `http://localhost:5000/account/${account.id}/verify`;

            const msg = {
              to: account.email,
              from: process.env.SENDGRID_SENDER,
              subject: "Verify your account",
              html: `<html><a href=${url}>${url}</a></html>`,
            };

            await sgMail.send(msg);

            await Notification.create({
              blogAccountId: account.id,
              text: "Your account was created successfully!",
            });

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

// Update user account username
router.put(
  "/account/username",
  ensureAuthenticatedUser,
  async (req, res, next) => {
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

      const usernameExist = await BlogAccount.findOne({
        where: {
          username: {
            [Op.iLike]: `@${value}`,
          },
        },
      });

      if (usernameExist) {
        return res.status(400).json({
          statusCode: 400,
          msg: `Username "${value}" exists! Try with another one!`,
        });
      }

      const updatedAccount = await updateUsername(
        req.user.id,
        `@${value.toLowerCase()}`
      );

      if (updatedAccount) {
        await Notification.create({
          blogAccountId: req.user.id,
          text: "Your username was updated successfully!",
        });

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
  }
);

// Update user account image
router.put(
  "/account/image",
  ensureAuthenticatedUser,
  fileUpload({
    useTempFiles: true,
    tempFileDir: `${__dirname}/../../uploads`,
  }),
  async (req, res, next) => {
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

        const userUpdated = await updateUserImage(
          req.user.id,
          result.secure_url,
          result.public_id
        );

        await Notification.create({
          blogAccountId: req.user.id,
          text: "Your profile image was updated successfully!",
        });

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
  }
);

// Delete user account image
router.delete(
  "/account/image",
  ensureAuthenticatedUser,
  async (req, res, next) => {
    try {
      const account = await BlogAccount.findByPk(req.user.id);

      if (account.image_id === null) {
        return res.status(400).json({
          statusCode: 400,
          msg: "You do not have a profile image to delete!",
        });
      }

      await deleteImage(account.image_id);

      const updatedAccount = await BlogAccount.update(
        {
          image: null,
          image_id: null,
        },
        {
          where: {
            id: req.user.id,
          },
        }
      );

      if (updatedAccount[0] === 1) {
        const account = await getBlogAccountById(id);

        return res.status(200).json({
          statusCode: 200,
          msg: "Profile image delete successfully!",
          data: account,
        });
      }
    } catch (error) {
      return next("Error trying to delete profile account user image");
    }
  }
);

// Delete user account image
router.delete("/account", ensureAuthenticatedUser, async (req, res, next) => {
  try {
    const account = await BlogAccount.findByPk(req.user.id);

    const deletedAccount = await BlogAccount.destroy({
      where: {
        id: req.user.id,
      },
    });

    if (deletedAccount) {
      if (account.image_id !== null) {
        await deleteImage(account.image_id);
      }

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
});

module.exports = router;
