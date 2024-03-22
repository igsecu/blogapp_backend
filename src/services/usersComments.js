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

module.exports = {
  createComment,
  getCommentById,
};
