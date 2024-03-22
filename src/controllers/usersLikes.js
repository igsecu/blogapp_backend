const notificationsServices = require("../services/notifications");
const usersPostsServices = require("../services/usersPosts");
const usersLikesServices = require("../services/usersLikes");

const { validateId } = require("../utils/index");

// Create like
const createLike = async (req, res, next) => {
  const { id } = req.params;

  try {
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

    const likeFound = await usersLikesServices.checkLikeExists(req.user.id, id);

    if (likeFound) {
      return res.status(400).json({
        statusCode: 400,
        msg: "You can not like a post twice!",
      });
    }

    const likeCreated = await usersLikesServices.createLike(req.user.id, id);

    if (likeCreated) {
      if (post.blog.account.id !== req.user.id) {
        await notificationsServices.createNotification(
          post.blog.account.id,
          `${
            req.user.username ? req.user.username : req.user.email
          } liked your post ${post.title}!`
        );
      }

      return res.status(201).json({
        statusCode: 201,
        msg: `You liked the post: ${post.title}`,
      });
    }
  } catch (error) {
    console.log(error.message);
    return next("Error trying to like a post");
  }
};

// Delete like
const deleteLike = async (req, res, next) => {
  const { id } = req.params;

  try {
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

    const likeFound = await usersLikesServices.checkLikeExists(req.user.id, id);

    if (!likeFound) {
      return res.status(400).json({
        statusCode: 400,
        msg: "You can not dislike a post that you did not like!",
      });
    }

    const likeDeleted = await usersLikesServices.deleteLike(likeFound.id, id);

    if (likeDeleted) {
      return res.status(200).json({
        statusCode: 201,
        msg: `You disliked the post: ${post.title}`,
      });
    }
  } catch (error) {
    console.log(error.message);
    return next("Error trying to dislike a post");
  }
};

module.exports = { createLike, deleteLike };
