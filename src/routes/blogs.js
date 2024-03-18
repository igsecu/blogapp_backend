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
  validateName,
} = require("../utils/index");

const {
  getBlogAccountById,
  updateUserImage,
  updateUsername,
  updateIsVerifiedAccount,
  getBlogById,
  updateBlogName,
} = require("../controllers/blogs");

const bcrypt = require("bcryptjs");

const { Op } = require("sequelize");

const passport = require("passport");

require("dotenv").config();

const sgMail = require("@sendgrid/mail");
const Token = require("../models/Token");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const uuid = require("uuid");

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
router.get("/account/:id/verify", async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!validateId(id)) {
      return res.status(400).json({
        statusCode: 400,
        msg: `ID: ${id} - Invalid format!`,
      });
    }

    const accountFound = await getBlogAccountById(id);

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

    const updatedAccount = await updateIsVerifiedAccount(id);

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
});

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

// Create new blog
router.post("/blog", ensureAuthenticatedUser, async (req, res, next) => {
  const { name } = req.body;

  if (validateName(name)) {
    return res.status(400).json({
      statusCode: 400,
      msg: validateName(name),
    });
  }

  try {
    const blogFound = await Blog.findOne({
      where: {
        name: {
          [Op.iLike]: name,
        },
      },
    });

    if (blogFound) {
      return res.status(400).json({
        statusCode: 400,
        msg: `Blog with name: ${name} exists! Try with another one...`,
      });
    }

    const blogCreated = await Blog.create({
      blogAccountId: req.user.id,
      name,
    });

    if (blogCreated) {
      await Notification.create({
        blogAccountId: req.user.id,
        text: `Blog "${blogCreated.name}" was created successfully!`,
      });
    }

    const blog = await getBlogById(blogCreated.id);

    res.status(201).json({
      statusCode: 201,
      msg: "Blog created successfull!",
      data: blog,
    });
  } catch (error) {
    return next("Error trying to create a new blog");
  }
});

router.post("/reset/password", async (req, res, next) => {
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

    const account = await getBlogAccountById(accountId);

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

    const tokenExists = await Token.findOne({
      where: {
        blogAccountId: accountId,
      },
    });

    if (!tokenExists) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Token for the account: ${accountId} not found!`,
      });
    }

    if (tokenExists.dataValues.token !== token) {
      return res.status(400).json({
        statusCode: 400,
        msg: "Invalid token!",
      });
    }

    const tokenTime = tokenExists.dataValues.createdAt.getTime();
    const expireTime = tokenTime + 3600 * 1000;

    const currentTime = new Date().getTime();

    if (currentTime >= expireTime) {
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
          const updatedAccount = await BlogAccount.update(
            {
              password: hash,
            },
            {
              where: {
                id: accountId,
              },
            }
          );

          if (updatedAccount[0] === 1) {
            const account = await getBlogAccountById(accountId);

            const msg = {
              to: account.email,
              from: process.env.SENDGRID_SENDER,
              subject: "Reset Password Confirmation",
              html: `<html><p>Your password was reseted successfully!</p></html>`,
            };

            await sgMail.send(msg);

            await Token.destroy({
              where: {
                blogAccountId: accountId,
              },
            });

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
});

router.post("/request/password", async (req, res, next) => {
  const { email } = req.body;

  try {
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

    const tokenExist = await Token.findOne({
      where: {
        blogAccountId: emailExist.dataValues.id,
      },
    });

    if (tokenExist) {
      await Token.destroy({
        where: {
          id: tokenExist.dataValues.id,
        },
      });
    }

    const newToken = await Token.create({
      blogAccountId: emailExist.dataValues.id,
      token: uuid.v4(),
    });

    /* const url = `http://localhost:5000/api/account/reset/password?token=${newToken.token}&accounId=${emailExist.dataValues.id}`;

    const msg = {
      to: email,
      from: process.env.SENDGRID_SENDER,
      subject: "Reset Password",
      html: `<html><a href=${url}>${url}</a></html>`,
    };

    await sgMail.send(msg); */

    return res.status(200).json({
      statusCode: 200,
      msg: "Check your email to reset your password!",
      token: newToken.token,
      accountId: emailExist.dataValues.id,
    });
  } catch (error) {
    return next("Error sending link to reset password");
  }
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

            /* const url = `http://localhost:5000/api/account/${account.id}/verify`;

            const msg = {
              to: account.email,
              from: process.env.SENDGRID_SENDER,
              subject: "Verify your account",
              html: `<html><a href=${url}>${url}</a></html>`,
            };

            await sgMail.send(msg); */

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

// Update blog name
router.put("/blog/:id", ensureAuthenticatedUser, async (req, res, next) => {
  const { id } = req.params;

  const { name } = req.body;

  try {
    if (!validateId(id)) {
      return res.status(400).json({
        statusCode: 400,
        msg: `ID: ${id} - Invalid format!`,
      });
    }

    const blog = await getBlogById(id);

    if (!blog) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Blog with ID: ${id} not found!`,
      });
    }

    console.log(blog.account);

    if (blog.account.id !== req.user.id) {
      return res.status(400).json({
        statusCode: 400,
        msg: "You can not update a blog that is not yours!",
      });
    }

    if (blog.isBanned === true) {
      return res.status(400).json({
        statusCode: 400,
        msg: "This blog is banned! You can not update its name...",
      });
    }

    if (validateName(name)) {
      return res.status(400).json({
        statusCode: 400,
        msg: validateName(name),
      });
    }

    const blogFound = await Blog.findOne({
      where: {
        name: {
          [Op.iLike]: name,
        },
      },
    });

    if (blogFound) {
      return res.status(400).json({
        statusCode: 400,
        msg: `Blog with name: ${name} exists! Try with another one...`,
      });
    }

    const updatedBlog = await updateBlogName(id, name);

    if (updatedBlog) {
      await Notification.create({
        blogAccountId: req.user.id,
        text: "The name of the blog was updated successfully!",
      });

      return res.status(200).json({
        statusCode: 200,
        msg: "Blog updated successfully!",
        data: updatedBlog,
      });
    }
  } catch (error) {
    console.log(error);
    return next("Error trying to update blog name");
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
