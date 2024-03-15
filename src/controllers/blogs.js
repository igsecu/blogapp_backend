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

// Update user image
const updateUserImage = async (id, image, image_id) => {
  try {
    const account = await BlogAccount.findByPk(id);

    if (account.image_id !== null) {
      await deleteImage(account.image_id);
    }

    const updatedAccount = await BlogAccount.update(
      {
        image,
        image_id,
      },
      {
        where: {
          id,
        },
      }
    );

    if (updatedAccount[0] === 1) {
      const account = await getBlogAccountById(id);

      return account;
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to update the user account profile image!");
  }
};

// Update user account username
const updateUsername = async (id, username) => {
  try {
    const updatedAccount = await BlogAccount.update(
      {
        username,
      },
      {
        where: {
          id,
        },
      }
    );

    if (updatedAccount[0] === 1) {
      const account = await getBlogAccountById(id);

      return account;
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to update the user account username!");
  }
};

module.exports = {
  getBlogAccountById,
  updateUserImage,
  updateUsername,
};
