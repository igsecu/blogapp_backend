const Post = require("../models/Post");

// Ban post
const banPost = async (id) => {
  try {
    const updatedPost = await Post.update(
      {
        isBanned: true,
      },
      {
        where: {
          id,
        },
      }
    );

    if (updatedPost) {
      return updatedPost;
    }
  } catch (error) {
    throw new Error("Error trying to ban a post");
  }
};

// not Ban post
const notBanPost = async (id) => {
  try {
    const updatedPost = await Post.update(
      {
        isBanned: false,
      },
      {
        where: {
          id,
        },
      }
    );

    if (updatedPost) {
      return updatedPost;
    }
  } catch (error) {
    throw new Error("Error trying to not ban a post");
  }
};

module.exports = {
  banPost,
  notBanPost,
};
