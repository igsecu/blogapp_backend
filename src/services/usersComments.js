const Blog = require("../models/Blog");
const BlogAccount = require("../models/BlogAccount");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

// Get Comment by Id
const getCommentById = async (id) => {
  try {
    const result = await Comment.findByPk(id, {
      attributes: ["id", "text", "isBanned"],
      include: {
        model: BlogAccount,
        attributes: ["id", "email", "username", "image"],
      },
    });

    if (result) {
      return {
        id: result.id,
        text: result.text,
        isBanned: result.isBanned,
        account: {
          id: result.blogAccount.id,
          email: result.blogAccount.email,
          username: result.blogAccount.username,
          image: result.blogAccount.image,
        },
      };
    }

    return result;
  } catch (error) {
    throw new Error("Error trying to get a comment by its id");
  }
};

// Create comment
const createComment = async (text, postId, id) => {
  try {
    const commentCreated = await Comment.create({
      text,
      postId,
      blogAccountId: id,
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

      const comment = await getCommentById(commentCreated.id);

      return comment;
    }
  } catch (error) {
    throw new Error("Error trying to create a new comment");
  }
};

// Get post comments
const getPostComments = async (id, page, limit) => {
  const results = [];
  try {
    const dbResults = await Comment.findAndCountAll({
      attributes: ["id", "text", "isBanned"],
      include: [
        {
          model: BlogAccount,
          attributes: ["id", "email", "username", "image"],
        },
        {
          model: Post,
          attributes: ["id"],
          where: {
            id,
          },
        },
      ],
      where: {
        isBanned: false,
      },
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
          account: {
            id: r.blogAccount.id,
            email: r.blogAccount.email,
            username: r.blogAccount.username,
            image: r.blogAccount.image,
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
    console.log(error.message);
    throw new Error("Error trying to get post comments");
  }
};

module.exports = {
  createComment,
  getCommentById,
  getPostComments,
};
