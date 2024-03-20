const { Op } = require("sequelize");

const Blog = require("../models//Blog");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const Like = require("../models/Like");
const BlogAccount = require("../models/BlogAccount");

// Get all blogs
const getBlogs = async () => {
  const results = [];
  try {
    const dbResults = await Blog.findAll({
      attributes: ["id", "name", "isBanned"],
      include: {
        model: BlogAccount,
        attributes: ["id", "email", "username", "isBanned"],
      },
    });

    if (dbResults) {
      dbResults.forEach((r) => {
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
    }

    return results;
  } catch (error) {
    throw new Error("Error trying to get all blogs");
  }
};

// Get all blogs pagination
const getBlogsPagination = async (id, page, limit) => {
  const results = [];
  try {
    const dbResults = await Blog.findAll({
      attributes: ["id", "name", "isBanned"],
      include: {
        model: BlogAccount,
        attributes: ["id", "email", "username", "isBanned"],
        where: {
          id: {
            [Op.not]: id,
          },
        },
      },
      order: [["createdAt", "DESC"]],
      limit,
      offset: page * limit - limit,
    });

    if (dbResults) {
      dbResults.forEach((r) => {
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
    }

    return results;
  } catch (error) {
    throw new Error("Error trying to get all blogs");
  }
};

module.exports = {
  getBlogs,
  getBlogsPagination,
};
