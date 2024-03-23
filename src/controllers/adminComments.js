const adminCommentsServices = require("../services/adminComments");
const usersCommentsServices = require("../services/usersComments");

const { validateId, validatePage, validateLimit } = require("../utils/index");

// Ban comment
const banComment = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!validateId(id)) {
      return res.status(400).json({
        statusCode: 400,
        msg: `ID: ${id} - Invalid format!`,
      });
    }

    const commentFound = await usersCommentsServices.getCommentById(id);

    if (!commentFound) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Comment with ID: ${id} not found!`,
      });
    }

    const updatedComment = await adminCommentsServices.banComment(id);

    if (updatedComment) {
      return res.status(200).json({
        statusCode: 200,
        msg: "Comment updated successfully!",
      });
    }
  } catch (error) {
    return next("Error trying to ban a comment");
  }
};

// not Ban comment
const notBanComment = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!validateId(id)) {
      return res.status(400).json({
        statusCode: 400,
        msg: `ID: ${id} - Invalid format!`,
      });
    }

    const commentFound = await usersCommentsServices.getCommentById(id);

    if (!commentFound) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Comment with ID: ${id} not found!`,
      });
    }

    const updatedComment = await adminCommentsServices.notBanComment(id);

    if (updatedComment) {
      return res.status(200).json({
        statusCode: 200,
        msg: "Comment updated successfully!",
      });
    }
  } catch (error) {
    return next("Error trying to not ban a comment");
  }
};

// Get comments
const getComments = async (req, res, next) => {
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

    const comments = await adminCommentsServices.getComments(
      page ? page : 1,
      limit ? limit : 10
    );

    if (!comments) {
      return res.status(404).json({
        statusCode: 404,
        msg: "No comments saved in DB!",
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
  banComment,
  notBanComment,
  getComments,
};
