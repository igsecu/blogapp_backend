const Comment = require("../models/Comment");
const BlogAccount = require("../models/BlogAccount");
const Post = require("../models/Post");

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

// Get comments
const getComments = async (page, limit) => {
  const results = [];
  try {
    const dbResults = await Comment.findAndCountAll({
      attributes: ["id", "text", "isBanned"],
      include: [
        {
          model: BlogAccount,
          attributes: ["id", "email", "username"],
        },
        {
          model: Post,
          attributes: ["id", "title"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset: page * limit - limit,
    });

    if (dbResults.count === 0) {
      return false;
    }

    if (dbResults.rows.length > 0) {
      dbResults.rows.forEach((r) => {
        results.push({
          id: r.id,
          text: r.text,
          isBanned: r.isBanned,
          account: {
            id: r.blogAccount.id,
            email: r.blogAccount.email,
            username: r.blogAccount.username,
          },
          post: {
            id: r.post.id,
            title: r.post.title,
          },
        });
      });
      return {
        totalResults: dbResults.count,
        totalPages: Math.ceil(dbResults.count / limit),
        page: parseInt(page),
        data: results,
      };
    } else {
      return { data: [] };
    }
  } catch (error) {
    throw new Error("Error trying to get all comments");
  }
};

module.exports = {
  banComment,
  notBanComment,
  getComments,
};
