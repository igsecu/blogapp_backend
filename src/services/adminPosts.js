const Post = require("../models/Post");
const Blog = require("../models/Blog");
const BlogAccount = require("../models/BlogAccount");

const { Op } = require("sequelize");

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

// Get all posts
const getPosts = async (page, limit) => {
  const results = [];
  try {
    const dbResults = await Post.findAndCountAll({
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
          },
        },
      ],
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
    throw new Error("Error trying to get all posts");
  }
};

// Get filtered posts
const getFilteredPosts = async (text, page, limit) => {
  const results = [];
  try {
    const dbResults = await Post.findAndCountAll({
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
          },
        },
      ],
      where: {
        [Op.or]: {
          title: {
            [Op.iLike]: `%${text}%`,
          },
          text: {
            [Op.iLike]: `%${text}%`,
          },
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
    throw new Error("Error trying to get filtered posts");
  }
};

module.exports = {
  banPost,
  notBanPost,
  getPosts,
  getFilteredPosts,
};
