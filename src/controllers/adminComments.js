const adminCommentsServices = require("../services/adminComments");
const usersCommentsServices = require("../services/usersComments");

const { validateId } = require("../utils/index");

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

module.exports = {
  banComment,
  notBanComment,
};
