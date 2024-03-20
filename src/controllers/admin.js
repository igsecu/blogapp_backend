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

// Get blog account blogs
const getBlogAccountBlogs = async (id) => {
  const results = [];
  try {
    const dbResults = await Blog.findAll({
      attributes: ["id", "name", "isBanned"],
      include: {
        model: BlogAccount,
        attributes: ["id", "email", "username", "isBanned"],
        where: {
          id,
          isBanned: false,
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
    throw new Error("Error trying to get all blogs");
  }
};

// Get blog account blogs pagination
const getBlogAccountBlogsPagination = async (id, page, limit) => {
  const results = [];
  try {
    const dbResults = await Blog.findAll({
      attributes: ["id", "name", "isBanned"],
      include: {
        model: BlogAccount,
        attributes: ["id", "email", "username", "isBanned"],
        where: {
          id,
          isBanned: false,
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
    throw new Error("Error trying to get all blogs");
  }
};

// Get all posts
const getPosts = async (id) => {
  const results = [];
  try {
    const dbResults = await Post.findAll({
      attributes: [
        "id",
        "title",
        "text",
        "isBanned",
        "readers",
        "comments_number",
        "likes_number",
        "image",
      ],
      include: [
        {
          model: Blog,
          attributes: ["id", "name", "isBanned"],
          include: {
            model: BlogAccount,
            attributes: ["id", "username", "email", "isBanned"],
            where: {
              id: {
                [Op.not]: id,
              },
            },
          },
        },
      ],
    });

    if (dbResults) {
      dbResults.forEach((r) => {
        results.push({
          id: r.id,
          title: r.title,
          text: r.text,
          isBanned: r.isBanned,
          readers: r.readers,
          likes: r.likes_number,
          comments: r.comments_number,
          image: r.image,
          blog: {
            id: r.blog.id,
            name: r.blog.name,
            isBanned: r.blog.isBanned,
            account: {
              id: r.blog.blogAccount.id,
              username: r.blog.blogAccount.username,
              image: r.blog.blogAccount.image,
              isBanned: r.blog.blogAccount.isBanned,
            },
          },
        });
      });
    }

    return results;
  } catch (error) {
    throw new Error("Error trying to get all posts");
  }
};

// Get all posts pagination
const getPostsPagination = async (id, page, limit) => {
  const results = [];
  try {
    const dbResults = await Post.findAll({
      attributes: [
        "id",
        "title",
        "text",
        "isBanned",
        "readers",
        "comments_number",
        "likes_number",
        "image",
      ],
      include: [
        {
          model: Blog,
          attributes: ["id", "name", "isBanned"],
          include: {
            model: BlogAccount,
            attributes: ["id", "username", "email", "isBanned"],
            where: {
              id: {
                [Op.not]: id,
              },
            },
          },
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset: page * limit - limit,
    });

    if (dbResults) {
      dbResults.forEach((r) => {
        results.push({
          id: r.id,
          title: r.title,
          text: r.text,
          isBanned: r.isBanned,
          readers: r.readers,
          likes: r.likes_number,
          comments: r.comments_number,
          image: r.image,
          blog: {
            id: r.blog.id,
            name: r.blog.name,
            isBanned: r.blog.isBanned,
            account: {
              id: r.blog.blogAccount.id,
              username: r.blog.blogAccount.username,
              image: r.blog.blogAccount.image,
              isBanned: r.blog.blogAccount.isBanned,
            },
          },
        });
      });
    }

    return results;
  } catch (error) {
    throw new Error("Error trying to get all posts");
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
  getBlogAccountBlogs,
  getBlogAccountBlogsPagination,
  getPosts,
  getPostsPagination,
};
