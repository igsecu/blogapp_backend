const Blog = require("../models/Blog");
const BlogAccount = require("../models/BlogAccount");

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

// Get all blogs
const getBlogs = async (page, limit) => {
  const results = [];
  try {
    const dbResults = await Blog.findAndCountAll({
      attributes: ["id", "name", "isBanned"],
      include: {
        model: BlogAccount,
        attributes: ["id", "email", "username", "isBanned"],
        where: {
          isAdmin: false,
        },
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
          name: r.name,
          isBanned: r.isBanned,
          account: {
            id: r.blogAccount.id,
            email: r.blogAccount.email,
            username: r.blogAccount.username,
            isBanned: r.blogAccount.isBanned,
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
    throw new Error("Error trying to get all blogs");
  }
};

module.exports = {
  banBlog,
  notBanBlog,
  getBlogs,
};
