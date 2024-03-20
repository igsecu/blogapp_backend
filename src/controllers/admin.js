const { Op } = require("sequelize");

const Blog = require("../models//Blog");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const Like = require("../models/Like");
const BlogAccount = require("../models/BlogAccount");

// Get all blogs
const getBlogs = async (id) => {
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

// Get banned blogs
const getBannedBlogs = async (id) => {
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
      where: {
        isBanned: true,
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
    throw new Error("Error trying to get banned blogs");
  }
};

// Get banned blogs Pagination
const getBannedBlogsPagination = async (id, page, limit) => {
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
      where: {
        isBanned: true,
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
    throw new Error("Error trying to get banned blogs");
  }
};

// Get not banned blogs
const getNotBannedBlogs = async (id) => {
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
      where: {
        isBanned: false,
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
    throw new Error("Error trying to get not banned blogs");
  }
};

// Get not banned blogs Pagination
const getNotBannedBlogsPagination = async (id, page, limit) => {
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
      where: {
        isBanned: false,
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
    throw new Error("Error trying to get not banned blogs");
  }
};

// Get all blogs Auth
const getBlogsAuth = async (id) => {
  const results = [];
  try {
    const dbResults = await Blog.findAll({
      attributes: ["id", "name", "isBanned"],
      include: {
        model: BlogAccount,
        attributes: ["id", "email", "username", "isBanned"],
        where: {
          id,
        },
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

// Get all blogs Auth pagination
const getBlogsAuthPagination = async (id, page, limit) => {
  const results = [];
  try {
    const dbResults = await Blog.findAll({
      attributes: ["id", "name", "isBanned"],
      include: {
        model: BlogAccount,
        attributes: ["id", "email", "username", "isBanned"],
        where: {
          id,
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
  getBannedBlogs,
  getBannedBlogsPagination,
  getNotBannedBlogs,
  getNotBannedBlogsPagination,
  getBlogsAuth,
  getBlogsAuthPagination,
};
