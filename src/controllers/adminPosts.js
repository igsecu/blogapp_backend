const adminPostsServices = require("../services/adminPosts");
const usersPostServices = require("../services/usersPosts");

const { validateId } = require("../utils/index");

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

module.exports = {
  banPost,
  notBanPost,
};
