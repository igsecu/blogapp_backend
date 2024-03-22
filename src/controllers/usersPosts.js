const fsExtra = require("fs-extra");

const notificationsServices = require("../services/notifications");
const usersPostsServices = require("../services/usersPosts");
const usersBlogsServices = require("../services/usersBlogs");

const {
  validateId,
  validateName,
  validateText,
  validateTitle,
  validateFileType,
  validateImageSize,
} = require("../utils/index");

const { uploadPostImage } = require("../utils/cloudinary");

// Create new post
const createPost = async (req, res, next) => {
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

    const blog = await usersBlogsServices.getBlogById(blogId);

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

      const postCreated = await usersPostsServices.createPost(
        title,
        text,
        blogId,
        result.secure_url,
        result.public_id
      );

      if (postCreated) {
        await notificationsServices.createNotification(
          req.user.id,
          `Your post ${postCreated.title} was created successfully!`
        );

        res.status(201).json({
          statusCode: 201,
          msg: "Post created successfully!",
          data: post,
        });
      }
    } else {
      const postCreated = await usersPostsServices.createPost(
        title,
        text,
        blogId
      );

      if (postCreated) {
        await notificationsServices.createNotification(
          req.user.id,
          `Your post ${postCreated.title} was created successfully!`
        );

        res.status(201).json({
          statusCode: 201,
          msg: "Post created successfully!",
          data: postCreated,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return next("Error trying to create new post");
  }
};

module.exports = {
  createPost,
};
