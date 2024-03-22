const Comment = require("../models/Comment");

// Ban comment
const banComment = async (id) => {
  try {
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
      return updatedComment;
    }
  } catch (error) {
    throw new Error("Error trying to ban a comment");
  }
};

// not Ban comment
const notBanComment = async (id) => {
  try {
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
      return updatedComment;
    }
  } catch (error) {
    throw new Error("Error trying to not ban a comment");
  }
};

module.exports = {
  banComment,
  notBanComment,
};
