const express = require("express");
const router = express.Router();

const Blog = require("../models/Blog");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const Like = require("../models/Like");
const BlogAccount = require("../models/BlogAccount");

const {
  uploadPostImage,
  uploadProfileImage,
  deleteImage,
} = require("../utils/cloudinary");
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
  validateText,
  validateTitle,
} = require("../utils/index");

const {
  getBlogAccountById,
  updateUserImage,
  updateUsername,
  updateIsVerifiedAccount,
  getBlogById,
  updateBlogName,
  getPostById,
  updatePostText,
  updatePostTitle,
  updatePostImage,
  getBlogPosts,
  getAccountBlogs,
  getCommentById,
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

// Verify account
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

// Create new like
router.post(
  "/like/post/:id",
  ensureAuthenticatedUser,
  async (req, res, next) => {
    const { id } = req.params;

    try {
      if (!validateId(id)) {
        return res.status(400).json({
          statusCode: 400,
          msg: `ID: ${id} - Invalid format!`,
        });
      }

      const post = await getPostById(id);

      if (!post) {
        return res.status(404).json({
          statusCode: 404,
          msg: `Post with ID: ${id} not found!`,
        });
      }

      if (post.isBanned === true) {
        return res.status(400).json({
          statusCode: 400,
          msg: "This post is banned! You can not like it...",
        });
      }

      if (post.blog.isBanned === true) {
        return res.status(400).json({
          statusCode: 400,
          msg: "The blog of the post is banned! You can not like it...",
        });
      }

      if (post.blog.account.isBanned === true) {
        return res.status(400).json({
          statusCode: 400,
          msg: "The account of the post is banned! You can not like it...",
        });
      }

      const likeFound = await Like.findOne({
        where: {
          blogAccountId: req.user.id,
          postId: id,
        },
      });

      if (likeFound) {
        return res.status(400).json({
          statusCode: 400,
          msg: "You can not like a post twice!",
        });
      }

      const likeCreated = await Like.create({
        blogAccountId: req.user.id,
        postId: id,
      });

      if (likeCreated) {
        if (post.blog.account.id !== req.user.id) {
          await Notification.create({
            blogAccountId: post.blog.account.id,
            text: `${
              req.user.username ? req.user.username : req.user.email
            } liked your post ${post.title}!`,
          });
        }

        await Post.increment(
          { likes_number: 1 },
          {
            where: {
              id,
            },
          }
        );

        return res.status(201).json({
          statusCode: 201,
          msg: `You liked the post: ${post.title}`,
        });
      }
    } catch (error) {
      console.log(error.message);
      return next("Error trying to like a post");
    }
  }
);

// Create new comment
router.post("/comment", ensureAuthenticatedUser, async (req, res, next) => {
  const { text, postId } = req.body;

  try {
    if (!postId) {
      return res.status(400).json({
        statusCode: 400,
        msg: "postId is missing",
      });
    }

    if (!validateId(postId)) {
      return res.status(400).json({
        statusCode: 400,
        msg: `postId: ${postId} - Invalid format!`,
      });
    }

    const post = await getPostById(postId);

    if (!post) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Post with ID: ${postId} not found!`,
      });
    }

    if (post.isBanned === true) {
      return res.status(400).json({
        statusCode: 400,
        msg: "This post is banned! You can not comment on it...",
      });
    }

    if (post.blog.isBanned === true) {
      return res.status(400).json({
        statusCode: 400,
        msg: "The blog of the post is banned! You can not comment on it...",
      });
    }

    if (post.blog.account.isBanned === true) {
      return res.status(400).json({
        statusCode: 400,
        msg: "The account of the post is banned! You can not comment on it...",
      });
    }

    if (validateText(text)) {
      return res.status(400).json({
        statusCode: 400,
        msg: validateText(text),
      });
    }

    const commentCreated = await Comment.create({
      text,
      postId,
      blogAccountId: req.user.id,
    });

    if (commentCreated) {
      await Post.increment(
        {
          comments_number: 1,
        },
        {
          where: {
            id: postId,
          },
        }
      );

      if (post.blog.account.id !== req.user.id) {
        await Notification.create({
          blogAccountId: post.blog.account.id,
          text: `You received a new comment in your post ${post.title}`,
        });
      }

      const comment = await getCommentById(commentCreated.id);

      res.status(201).json({
        statusCode: 201,
        msg: "Comment created successfully!",
        data: comment,
      });
    }
  } catch (error) {
    return next("Error trying to create a new comment");
  }
});

// Create new post
router.post(
  "/post",
  ensureAuthenticatedUser,
  fileUpload({
    useTempFiles: true,
    tempFileDir: `${__dirname}/../../uploads`,
  }),
  async (req, res, next) => {
    const { title, text, blogId } = req.body;

    try {
      if (validateTitle(title)) {
        return res.status(400).json({
          statusCode: 400,
          msg: validateTitle(title),
        });
      }

      if (validateText(text)) {
        return res.status(400).json({
          statusCode: 400,
          msg: validateText(text),
        });
      }

      if (!blogId) {
        return res.status(400).json({
          statusCode: 400,
          msg: "blogId is missing",
        });
      }

      if (!validateId(blogId)) {
        return res.status(400).json({
          statusCode: 400,
          msg: `blogId: ${blogId} - Invalid format!`,
        });
      }

      const blog = await getBlogById(blogId);

      if (!blog) {
        return res.status(404).json({
          statusCode: 404,
          msg: `Blog with ID: ${blogId} not found!`,
        });
      }

      if (blog.account.id !== req.user.id) {
        return res.status(400).json({
          statusCode: 400,
          msg: "This blog is not yours! You can not create a new post...",
        });
      }

      if (blog.isBanned === true) {
        return res.status(400).json({
          statusCode: 400,
          msg: "This blog is banned! You can not create a post...",
        });
      }

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

        const result = await uploadPostImage(req.files.image.tempFilePath);

        await fsExtra.unlink(req.files.image.tempFilePath);

        const postCreated = await Post.create({
          title,
          text,
          blogId,
          image: result.secure_url,
          image_id: result.public_id,
        });

        if (postCreated) {
          await Notification.create({
            blogAccountId: req.user.id,
            text: `Your post ${postCreated.title} was created successfully!`,
          });
        }

        const post = await getPostById(postCreated.id);

        res.status(201).json({
          statusCode: 201,
          msg: "Post created successfully!",
          data: post,
        });
      } else {
        const postCreated = await Post.create({
          title,
          text,
          blogId,
        });

        if (postCreated) {
          await Notification.create({
            blogAccountId: req.user.id,
            text: `Your post ${postCreated.title} was created successfully!`,
          });
        }

        const post = await getPostById(postCreated.id);

        res.status(201).json({
          statusCode: 201,
          msg: "Post created successfully!",
          data: post,
        });
      }
    } catch (error) {
      console.log(error);
      return next("Error trying to create new post");
    }
  }
);

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
router.post("/account/admin", async (req, res, next) => {
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
            isAdmin: true,
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

// Ban account
router.put(
  "/account/:id/banned/true",
  ensureAuthenticatedAdmin,
  async (req, res, next) => {
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

      const updatedAccount = await BlogAccount.update(
        {
          isBanned: true,
        },
        {
          where: {
            id,
          },
        }
      );

      if (updatedAccount) {
        return res.status(200).json({
          statusCode: 200,
          msg: "Account updated successfully!",
        });
      }
    } catch (error) {
      return next("Error trying to ban an account");
    }
  }
);

// Not Ban account
router.put(
  "/account/:id/banned/false",
  ensureAuthenticatedAdmin,
  async (req, res, next) => {
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

      const updatedAccount = await BlogAccount.update(
        {
          isBanned: false,
        },
        {
          where: {
            id,
          },
        }
      );

      if (updatedAccount) {
        return res.status(200).json({
          statusCode: 200,
          msg: "Account updated successfully!",
        });
      }
    } catch (error) {
      return next("Error trying to not ban an account");
    }
  }
);

// Update post image
router.put(
  "/post/:id/image",
  ensureAuthenticatedUser,
  fileUpload({
    useTempFiles: true,
    tempFileDir: `${__dirname}/../../uploads`,
  }),
  async (req, res, next) => {
    const { id } = req.params;
    try {
      if (!validateId(id)) {
        return res.status(400).json({
          statusCode: 400,
          msg: `ID: ${id} - Invalid format!`,
        });
      }

      const post = await getPostById(id);

      if (!post) {
        return res.status(404).json({
          statusCode: 404,
          msg: `Post with ID: ${id} not found!`,
        });
      }

      if (post.blog.account.id !== req.user.id) {
        return res.status(400).json({
          statusCode: 400,
          msg: "You can not update a post that is not yours!",
        });
      }

      if (post.isBanned === true) {
        return res.status(400).json({
          statusCode: 400,
          msg: "This post is banned! You can not update it...",
        });
      }

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

        const result = await uploadPostImage(req.files.image.tempFilePath);

        await fsExtra.unlink(req.files.image.tempFilePath);

        const postUpdated = await updatePostImage(
          id,
          result.secure_url,
          result.public_id
        );

        return res.status(200).json({
          statusCode: 200,
          msg: "Post image was updated successfully!",
          data: postUpdated,
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

// Ban comment
router.put(
  "/comment/:id/banned/true",
  ensureAuthenticatedAdmin,
  async (req, res, next) => {
    const { id } = req.params;

    try {
      if (!validateId(id)) {
        return res.status(400).json({
          statusCode: 400,
          msg: `ID: ${id} - Invalid format!`,
        });
      }

      const commentFound = await getCommentById(id);

      if (!commentFound) {
        return res.status(404).json({
          statusCode: 404,
          msg: `Comment with ID: ${id} not found!`,
        });
      }

      const updatedComment = await Comment.update(
        {
          isBanned: true,
        },
        {
          where: {
            id,
          },
        }
      );

      if (updatedComment) {
        return res.status(200).json({
          statusCode: 200,
          msg: "Comment updated successfully!",
        });
      }
    } catch (error) {
      return next("Error trying to ban a comment");
    }
  }
);

// Not Ban comment
router.put(
  "/comment/:id/banned/false",
  ensureAuthenticatedAdmin,
  async (req, res, next) => {
    const { id } = req.params;

    try {
      if (!validateId(id)) {
        return res.status(400).json({
          statusCode: 400,
          msg: `ID: ${id} - Invalid format!`,
        });
      }

      const commentFound = await getCommentById(id);

      if (!commentFound) {
        return res.status(404).json({
          statusCode: 404,
          msg: `Comment with ID: ${id} not found!`,
        });
      }

      const updatedComment = await Comment.update(
        {
          isBanned: false,
        },
        {
          where: {
            id,
          },
        }
      );

      if (updatedComment) {
        return res.status(200).json({
          statusCode: 200,
          msg: "Comment updated successfully!",
        });
      }
    } catch (error) {
      return next("Error trying to not ban a comment");
    }
  }
);

// Ban post
router.put(
  "/post/:id/banned/true",
  ensureAuthenticatedAdmin,
  async (req, res, next) => {
    const { id } = req.params;

    try {
      if (!validateId(id)) {
        return res.status(400).json({
          statusCode: 400,
          msg: `ID: ${id} - Invalid format!`,
        });
      }

      const postFound = await getPostById(id);

      if (!postFound) {
        return res.status(404).json({
          statusCode: 404,
          msg: `Post with ID: ${id} not found!`,
        });
      }

      const updatedPost = await Post.update(
        {
          isBanned: true,
        },
        {
          where: {
            id,
          },
        }
      );

      if (updatedPost) {
        return res.status(200).json({
          statusCode: 200,
          msg: "Post updated successfully!",
        });
      }
    } catch (error) {
      return next("Error trying to ban a post");
    }
  }
);

// Not Ban post
router.put(
  "/post/:id/banned/false",
  ensureAuthenticatedAdmin,
  async (req, res, next) => {
    const { id } = req.params;

    try {
      if (!validateId(id)) {
        return res.status(400).json({
          statusCode: 400,
          msg: `ID: ${id} - Invalid format!`,
        });
      }

      const postFound = await getPostById(id);

      if (!postFound) {
        return res.status(404).json({
          statusCode: 404,
          msg: `Post with ID: ${id} not found!`,
        });
      }

      const updatedPost = await Post.update(
        {
          isBanned: false,
        },
        {
          where: {
            id,
          },
        }
      );

      if (updatedPost) {
        return res.status(200).json({
          statusCode: 200,
          msg: "Post updated successfully!",
        });
      }
    } catch (error) {
      return next("Error trying to not ban a post");
    }
  }
);

// Update post
router.put("/post/:id", ensureAuthenticatedUser, async (req, res, next) => {
  const { title, text } = req.query;
  const { id } = req.params;

  let postUpdated;

  try {
    if (!validateId(id)) {
      return res.status(400).json({
        statusCode: 400,
        msg: `ID: ${id} - Invalid format!`,
      });
    }

    const post = await getPostById(id);

    if (!post) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Post with ID: ${id} not found!`,
      });
    }

    if (post.blog.account.id !== req.user.id) {
      return res.status(400).json({
        statusCode: 400,
        msg: "You can not update a post that is not yours!",
      });
    }

    if (post.isBanned === true) {
      return res.status(400).json({
        statusCode: 400,
        msg: "This post is banned! You can not update it...",
      });
    }

    if (title) {
      postUpdated = await updatePostTitle(id, title);
    }

    if (text) {
      postUpdated = await updatePostText(id, text);
    }

    if (!title && !text) {
      return res.status(400).json({
        statusCode: 400,
        msg: "Query parameter is missing",
      });
    }

    res.status(200).json({
      statusCode: 200,
      msg: "Post updated successfully!",
      data: postUpdated,
    });
  } catch (error) {
    console.log(error);
    return next("Error trying to update post");
  }
});

// Ban blog
router.put(
  "/blog/:id/banned/true",
  ensureAuthenticatedAdmin,
  async (req, res, next) => {
    const { id } = req.params;

    try {
      if (!validateId(id)) {
        return res.status(400).json({
          statusCode: 400,
          msg: `ID: ${id} - Invalid format!`,
        });
      }

      const blogFound = await getBlogById(id);

      if (!blogFound) {
        return res.status(404).json({
          statusCode: 404,
          msg: `Blog with ID: ${id} not found!`,
        });
      }

      const updatedBlog = await Blog.update(
        {
          isBanned: true,
        },
        {
          where: {
            id,
          },
        }
      );

      if (updatedBlog) {
        return res.status(200).json({
          statusCode: 200,
          msg: "Blog updated successfully!",
        });
      }
    } catch (error) {
      return next("Error trying to ban a blog");
    }
  }
);

// Not Ban blog
router.put(
  "/blog/:id/banned/false",
  ensureAuthenticatedAdmin,
  async (req, res, next) => {
    const { id } = req.params;

    try {
      if (!validateId(id)) {
        return res.status(400).json({
          statusCode: 400,
          msg: `ID: ${id} - Invalid format!`,
        });
      }

      const blogFound = await getBlogById(id);

      if (!blogFound) {
        return res.status(404).json({
          statusCode: 404,
          msg: `Blog with ID: ${id} not found!`,
        });
      }

      const updatedBlog = await Blog.update(
        {
          isBanned: false,
        },
        {
          where: {
            id,
          },
        }
      );

      if (updatedBlog) {
        return res.status(200).json({
          statusCode: 200,
          msg: "Blog updated successfully!",
        });
      }
    } catch (error) {
      return next("Error trying to not ban a blog");
    }
  }
);

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

// Delete post image
router.delete(
  "/post/:id/image",
  ensureAuthenticatedUser,
  async (req, res, next) => {
    const { id } = req.params;

    try {
      if (!validateId(id)) {
        return res.status(400).json({
          statusCode: 400,
          msg: `ID: ${id} - Invalid format!`,
        });
      }

      const post = await getPostById(id);

      if (!post) {
        return res.status(404).json({
          statusCode: 404,
          msg: `Post with ID: ${id} not found!`,
        });
      }

      if (post.blog.account.id !== req.user.id) {
        return res.status(400).json({
          statusCode: 400,
          msg: "You can not delete a post image that is not yours!",
        });
      }

      const postToDelete = await Post.findByPk(id);

      if (!postToDelete.image_id) {
        return res.status(400).json({
          statusCode: 400,
          msg: "The post does not have an image to delete!",
        });
      }

      await deleteImage(postToDelete.image_id);

      const updatedPost = await Post.update(
        {
          image: null,
          image_id: null,
        },
        {
          where: {
            id,
          },
        }
      );

      if (updatedPost[0] === 1) {
        const post = await getPostById(id);

        return res.status(200).json({
          statusCode: 200,
          msg: "Post image deleted successfully!",
          data: post,
        });
      }
    } catch (error) {
      return next("Error trying to delete post image");
    }
  }
);

// Delete post
router.delete("/post/:id", ensureAuthenticatedUser, async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!validateId(id)) {
      return res.status(400).json({
        statusCode: 400,
        msg: `ID: ${id} - Invalid format!`,
      });
    }

    const post = await getPostById(id);

    if (!post) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Post with ID: ${id} not found!`,
      });
    }

    if (post.blog.account.id !== req.user.id) {
      return res.status(400).json({
        statusCode: 400,
        msg: "You can not delete a post that is not yours!",
      });
    }

    const postToDelete = await Post.findByPk(id);

    const deletedPost = await Post.destroy({
      where: {
        id,
      },
    });

    if (deletedPost) {
      if (postToDelete.image_id !== null) {
        await deleteImage(postToDelete.image_id);
      }

      await Notification.create({
        blogAccountId: req.user.id,
        text: `Post: ${post.title} was deleted successfully!`,
      });

      return res.status(200).json({
        statusCode: 200,
        msg: "Post deleted successfully!",
        data: post,
      });
    }
  } catch (error) {
    return next("Error trying to delete a post");
  }
});

// Delete blog
router.delete("/blog/:id", ensureAuthenticatedUser, async (req, res, next) => {
  const { id } = req.params;

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

    if (blog.account.id !== req.user.id) {
      return res.status(400).json({
        statusCode: 400,
        msg: "You can not delete a blog that is not yours!",
      });
    }

    const results = await getBlogPosts(id);

    for (let r of results) {
      const post = await Post.findByPk(r.id);

      if (post.image_id !== null) {
        await deleteImage(post.image_id);
      }

      await Post.destroy({
        where: {
          id: r.id,
        },
      });
    }

    const deletedBlog = await Blog.destroy({
      where: {
        id,
      },
    });

    if (deletedBlog) {
      await Notification.create({
        blogAccountId: req.user.id,
        text: `Blog: ${blog.name} was deleted successfully!`,
      });

      return res.status(200).json({
        statusCode: 200,
        msg: "Blog deleted successfully!",
        data: deletedBlog,
      });
    }
  } catch (error) {
    console.log(error);
    return next("Error trying to delete a blog");
  }
});

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
        const account = await getBlogAccountById(req.user.id);

        return res.status(200).json({
          statusCode: 200,
          msg: "Profile image deleted successfully!",
          data: account,
        });
      }
    } catch (error) {
      return next("Error trying to delete profile account user image");
    }
  }
);

// Delete user account
router.delete("/account", ensureAuthenticatedUser, async (req, res, next) => {
  try {
    const account = await BlogAccount.findByPk(req.user.id);

    const blogs = await getAccountBlogs(req.user.id);

    for (b of blogs) {
      const results = await getBlogPosts(b.id);

      for (let r of results) {
        const post = await Post.findByPk(r.id);

        if (post.image_id !== null) {
          await deleteImage(post.image_id);
        }

        await Post.destroy({
          where: {
            id: r.id,
          },
        });
      }
      await Blog.destroy({
        where: {
          id: b.id,
        },
      });
    }

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

// Deletelike
router.delete(
  "/like/post/:id",
  ensureAuthenticatedUser,
  async (req, res, next) => {
    const { id } = req.params;

    try {
      if (!validateId(id)) {
        return res.status(400).json({
          statusCode: 400,
          msg: `ID: ${id} - Invalid format!`,
        });
      }

      const post = await getPostById(id);

      if (!post) {
        return res.status(404).json({
          statusCode: 404,
          msg: `Post with ID: ${id} not found!`,
        });
      }

      if (post.isBanned === true) {
        return res.status(400).json({
          statusCode: 400,
          msg: "This post is banned! You can not dislike it...",
        });
      }

      if (post.blog.isBanned === true) {
        return res.status(400).json({
          statusCode: 400,
          msg: "The blog of the post is banned! You can not dislike it...",
        });
      }

      if (post.blog.account.isBanned === true) {
        return res.status(400).json({
          statusCode: 400,
          msg: "The account of the post is banned! You can not dislike it...",
        });
      }

      const likeFound = await Like.findOne({
        where: {
          blogAccountId: req.user.id,
          postId: id,
        },
      });

      if (!likeFound) {
        return res.status(400).json({
          statusCode: 400,
          msg: "You can not dislike a post that you did not like!",
        });
      }

      const likeDeleted = await Like.destroy({
        where: {
          id: likeFound.id,
        },
      });

      if (likeDeleted) {
        await Post.decrement(
          { likes_number: 1 },
          {
            where: {
              id,
            },
          }
        );

        return res.status(200).json({
          statusCode: 201,
          msg: `You disliked the post: ${post.title}`,
        });
      }
    } catch (error) {
      console.log(error.message);
      return next("Error trying to dislike a post");
    }
  }
);

module.exports = router;
