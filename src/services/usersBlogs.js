const Blog = require("../models/Blog");
const BlogAccount = require("../models/BlogAccount");

const { Op } = require("sequelize");

// Get blog by id
const getBlogById = async (id) => {
  try {
    const dbResult = await Blog.findByPk(id, {
      attributes: ["id", "name", "isBanned"],
      include: {
        model: BlogAccount,
        attributes: ["id", "email", "username", "isBanned"],
      },
    });

    if (dbResult) {
      return {
        id: dbResult.id,
        name: dbResult.name,
        isBanned: dbResult.isBanned,
        account: {
          id: dbResult.blogAccount.id,
          email: dbResult.blogAccount.email,
          username: dbResult.blogAccount.username,
          isBanned: dbResult.blogAccount.isBanned,
        },
      };
    }

    return dbResult;
  } catch (error) {
    throw new Error("Error trying to get a blog by its id");
  }
};

// Check if blog name exists
const checkBlogExists = async (name) => {
  try {
    const blogFound = await Blog.findOne({
      where: {
        name: {
          [Op.iLike]: name,
        },
      },
    });

    return blogFound;
  } catch (error) {
    throw new Error("Error trying to check if blog exists");
  }
};

// Create new blog
const createBlog = async (id, name) => {
  try {
    const blogCreated = await Blog.create({
      blogAccountId: id,
      name,
    });

    if (blogCreated) {
      const blog = await getBlogById(blogCreated.id);

      return blog;
    }
  } catch (error) {
    throw new Error("Error trying to create new blog");
  }
};

module.exports = {
  checkBlogExists,
  createBlog,
};
