const { Op } = require("sequelize");

const Blog = require("../models//Blog");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const Like = require("../models/Like");
const BlogAccount = require("../models/BlogAccount");

const { deleteImage } = require("../utils/cloudinary");

// Get account by id
const getBlogAccountById = async (id) => {
  try {
    const account = await BlogAccount.findByPk(id, {
      attributes: [
        "id",
        "email",
        "username",
        "isBanned",
        "isVerified",
        "image",
        "type",
      ],
    });

    if (account) {
      return {
        id: account.id,
        email: account.email,
        username: account.username,
        isBanned: account.isBanned,
        isVerified: account.isVerified,
        image: account.image,
        type: account.type,
      };
    }

    return account;
  } catch (error) {
    throw new Error("Error trying to get an account by its id");
  }
};

module.exports = {
  getBlogAccountById,
};
