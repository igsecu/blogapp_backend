const Blog = require("../models/Blog");

// Ban blog
const banBlog = async (id) => {
  try {
    const updatedBlog = await Blog.update(
      {
        isBanned: true,
      },
      {
        where: {
          id,
        },
      }
    );

    if (updatedBlog) {
      return updatedBlog;
    }
  } catch (error) {
    throw new Error("Error trying to ban a blog");
  }
};

// not Ban blog
const notBanBlog = async (id) => {
  try {
    const updatedBlog = await Blog.update(
      {
        isBanned: false,
      },
      {
        where: {
          id,
        },
      }
    );

    if (updatedBlog) {
      return updatedBlog;
    }
  } catch (error) {
    throw new Error("Error trying to ban a blog");
  }
};

module.exports = {
  banBlog,
  notBanBlog,
};
