const Blog = require("../models/Blog");
const BlogAccount = require("../models/BlogAccount");
const Post = require("../models/Post");

const { Op } = require("sequelize");

const { deleteImage } = require("../utils/cloudinary");

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

// Update blog name
const updateBlogName = async (id, name) => {
  try {
    const updatedBlog = await Blog.update(
      {
        name,
      },
      {
        where: {
          id,
        },
      }
    );

    if (updatedBlog[0] === 1) {
      const blog = await getBlogById(id);

      return blog;
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to update blog name!");
  }
};

// Get Blog Posts
const getBlogPosts = async (id) => {
  const array = [];
  try {
    const results = await Post.findAll({
      include: {
        model: Blog,
        where: {
          id,
        },
      },
    });

    if (results) {
      results.forEach((r) => {
        array.push({
          id: r.id,
          title: r.title,
          text: r.text,
          isBanned: r.isBanned,
          readers: r.readers,
          comments_number: r.comments_number,
          likes_number: r.likes_number,
          image: r.image,
        });
      });
    }

    return array;
  } catch (error) {
    throw new Error("Error trying to get all blog posts");
  }
};

// Delete blog
const deleteBlog = async (id) => {
  try {
    const blog = await getBlogById(id);

    const results = await getBlogPosts(id);

    for (let r of results) {
      const post = await Post.findByPk(r.id);

      if (post.image_id !== null) {
        await deleteImage(post.image_id);
      }

      await Post.destroy({
        where: {
          id: r.id,
        },
      });
    }

    const blogDeleted = await Blog.destroy({
      where: {
        id,
      },
    });

    if (blogDeleted) {
      return blog;
    }
  } catch (error) {
    throw new Error("Error trying to delete a blog");
  }
};

// Get all blogs
const getBlogs = async (id, page, limit) => {
  const results = [];
  try {
    const dbResults = await Blog.findAndCountAll({
      attributes: ["id", "name"],
      include: {
        model: BlogAccount,
        attributes: ["id", "email", "username", "image"],
        where: {
          id: {
            [Op.not]: id,
          },
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

    if (dbResults.count === 0) {
      return false;
    }

    if (dbResults.rows.length > 0) {
      dbResults.rows.forEach((r) => {
        results.push({
          id: r.id,
          name: r.name,
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
    throw new Error("Error trying to get all blogs");
  }
};

// Get filtered blogs
const getFilteredBlogs = async (id, name, page, limit) => {
  const results = [];
  try {
    const dbResults = await Blog.findAndCountAll({
      attributes: ["id", "name"],
      include: {
        model: BlogAccount,
        attributes: ["id", "email", "username", "image"],
        where: {
          id: {
            [Op.not]: id,
          },
          isBanned: false,
        },
      },
      where: {
        name: {
          [Op.iLike]: `%${name}%`,
        },
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
          name: r.name,
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
    throw new Error("Error trying to get filtered blogs");
  }
};

// Get account blogs
const getAccountBlogs = async (id, page, limit) => {
  const results = [];
  try {
    const dbResults = await Blog.findAndCountAll({
      attributes: ["id", "name"],
      include: {
        model: BlogAccount,
        attributes: ["id", "email", "username", "image"],
        where: { id, isBanned: false },
      },
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
          name: r.name,
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
    throw new Error("Error trying to get account blogs");
  }
};

// Get own blogs
const getOwnBlogs = async (id, page, limit) => {
  const results = [];
  try {
    const dbResults = await Blog.findAndCountAll({
      attributes: ["id", "name", "isBanned"],
      include: {
        model: BlogAccount,
        attributes: ["id", "email", "username", "image"],
        where: { id, isBanned: false },
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
    throw new Error("Error trying to get own blogs");
  }
};

module.exports = {
  checkBlogExists,
  createBlog,
  getBlogById,
  updateBlogName,
  deleteBlog,
  getBlogPosts,
  getBlogs,
  getFilteredBlogs,
  getAccountBlogs,
  getOwnBlogs,
};
