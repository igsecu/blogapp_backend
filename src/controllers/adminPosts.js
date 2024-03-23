const adminPostsServices = require("../services/adminPosts");
const usersPostServices = require("../services/usersPosts");

const { validateId, validateLimit, validatePage } = require("../utils/index");

// Ban post
const banPost = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!validateId(id)) {
      return res.status(400).json({
        statusCode: 400,
        msg: `ID: ${id} - Invalid format!`,
      });
    }

    const postFound = await usersPostServices.getPostById(id);

    if (!postFound) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Post with ID: ${id} not found!`,
      });
    }

    const updatedPost = await adminPostsServices.banPost(id);

    if (updatedPost) {
      return res.status(200).json({
        statusCode: 200,
        msg: "Post updated successfully!",
      });
    }
  } catch (error) {
    return next("Error trying to ban a post");
  }
};

// not Ban post
const notBanPost = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!validateId(id)) {
      return res.status(400).json({
        statusCode: 400,
        msg: `ID: ${id} - Invalid format!`,
      });
    }

    const postFound = await usersPostServices.getPostById(id);

    if (!postFound) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Post with ID: ${id} not found!`,
      });
    }

    const updatedPost = await adminPostsServices.notBanPost(id);

    if (updatedPost) {
      return res.status(200).json({
        statusCode: 200,
        msg: "Post updated successfully!",
      });
    }
  } catch (error) {
    return next("Error trying to ban a post");
  }
};

// Get posts
const getPosts = async (req, res, next) => {
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

    const posts = await adminPostsServices.getPosts(
      page ? page : 1,
      limit ? limit : 10
    );

    if (!posts) {
      return res.status(404).json({
        statusCode: 404,
        msg: "No posts saved in DB!",
      });
    }

    if (!posts.data.length) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Page ${page} not found!`,
      });
    }

    res.status(200).json({
      statusCode: 200,
      ...posts,
    });
  } catch (error) {
    return next(error);
  }
};

// Get filtered posts by text and title
const getFilteredPosts = async (req, res, next) => {
  const { page, limit, text } = req.query;
  try {
    if (!text) {
      return res.status(400).json({
        statusCode: 400,
        msg: "Text query is missing",
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

    const posts = await adminPostsServices.getFilteredPosts(
      text,
      page ? page : 1,
      limit ? limit : 10
    );

    if (!posts) {
      return res.status(404).json({
        statusCode: 404,
        msg: `No posts with text: ${text} found!`,
      });
    }

    if (!posts.data.length) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Page ${page} not found!`,
      });
    }

    res.status(200).json({
      statusCode: 200,
      ...posts,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  banPost,
  notBanPost,
  getPosts,
  getFilteredPosts,
};
