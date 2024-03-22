const BlogAccount = require("../models/BlogAccount");
const Post = require("../models/Post");
const Like = require("../models/Like");

// Check if like exists
const checkLikeExists = async (id, postId) => {
  try {
    const likeFound = await Like.findOne({
      where: {
        blogAccountId: id,
        postId,
      },
    });

    return likeFound;
  } catch (error) {
    throw new Error("Error trying to check if like exists");
  }
};

// Create Like
const createLike = async (id, postId) => {
  try {
    const likeCreated = await Like.create({
      blogAccountId: id,
      postId,
    });

    if (likeCreated) {
      await Post.increment(
        { likes_number: 1 },
        {
          where: {
            id: postId,
          },
        }
      );
      return likeCreated;
    }
  } catch (error) {
    throw new Error("Error trying to create a new like");
  }
};

module.exports = {
  checkLikeExists,
  createLike,
};
