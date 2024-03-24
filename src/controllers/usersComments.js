const notificationsServices = require("../services/notifications");
const usersPostsServices = require("../services/usersPosts");
const usersCommentsServices = require("../services/usersComments");

const {
  validateId,
  validateName,
  validateText,
  validateTitle,
} = require("../utils/index");

// Create new comment
const createComment = async (req, res, next) => {
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

    const post = await usersPostsServices.getPostById(postId);

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

    const commentCreated = await usersCommentsServices.createComment(
      text,
      postId,
      req.user.id
    );

    if (commentCreated) {
      if (post.blog.account.id !== req.user.id) {
        await notificationsServices.createNotification(
          post.blog.account.id,
          `You received a new comment in your post ${post.title}`
        );
      }

      res.status(201).json({
        statusCode: 201,
        msg: "Comment created successfully!",
        data: commentCreated,
      });
    }
  } catch (error) {
    return next(error);
  }
};

// Get posts comments
const getPostComments = async (req, res, next) => {
  const { id } = req.params;
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

    if (!validateId(id)) {
      return res.status(400).json({
        statusCode: 400,
        msg: `ID: ${id} - Invalid format!`,
      });
    }

    const post = await usersPostsServices.getPostById(id);

    if (!post) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Post with ID: ${id} not found!`,
      });
    }

    if (post.isBanned === true && post.blog.account.id !== req.user.id) {
      return res.status(400).json({
        statusCode: 400,
        msg: "This post is banned! You can not access to its comments...",
      });
    }

    if (post.blog.isBanned === true && post.blog.account.id !== req.user.id) {
      return res.status(400).json({
        statusCode: 400,
        msg: "The blog of the post is banned! You can not access to its comments...",
      });
    }

    if (post.blog.account.isBanned === true) {
      return res.status(400).json({
        statusCode: 400,
        msg: "The account of the post is banned! You can not access to its comments...",
      });
    }

    const comments = await usersCommentsServices.getPostComments(
      id,
      page ? page : 1,
      limit ? limit : 10
    );

    if (!comments) {
      return res.status(404).json({
        statusCode: 404,
        msg: "This post does not have comments!",
      });
    }

    if (!comments.data.length) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Page ${page} not found!`,
      });
    }

    res.status(200).json({
      statusCode: 200,
      ...comments,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createComment,
  getPostComments,
};
