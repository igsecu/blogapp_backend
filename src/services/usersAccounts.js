const { Op } = require("sequelize");
const BlogAccount = require("../models/BlogAccount");
const Blog = require("../models/Blog");
const Post = require("../models/Post");

const { deleteImage } = require("../utils/cloudinary");

const usersBlogsServices = require("../services/usersBlogs");

// Check if email exists
const checkEmailExists = async (email) => {
  try {
    const emailFound = await BlogAccount.findOne({
      where: {
        email,
      },
    });

    return emailFound;
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to check if email exists");
  }
};

// Create account
const createAccount = async (hash, email) => {
  try {
    const accountCreated = await BlogAccount.create({
      password: hash,
      email: email.toLowerCase(),
    });

    return accountCreated;
  } catch (error) {
    throw new Error("Error trying to create new account");
  }
};

// Create account from Github or Google
const createAccountFromGithubOrGoogle = async (email) => {
  try {
    const accountCreated = await BlogAccount.create({
      email: email.toLowerCase(),
    });

    return accountCreated;
  } catch (error) {
    throw new Error("Error trying to create new account");
  }
};

// Get account by id
const getAccountById = async (id) => {
  try {
    const account = await BlogAccount.findByPk(id, {
      attributes: [
        "id",
        "email",
        "username",
        "isBanned",
        "isVerified",
        "image",
        "isAdmin",
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
        isAdmin: account.isAdmin,
      };
    }

    return account;
  } catch (error) {
    throw new Error("Error trying to get an account by its id");
  }
};

// Get account blogs
const getAccountBlogs = async (id) => {
  const array = [];
  try {
    const results = await Blog.findAll({
      include: {
        model: BlogAccount,
        where: {
          id,
        },
      },
    });

    if (results) {
      results.forEach((r) => {
        array.push({
          id: r.id,
          name: r.name,
          isBanned: r.isBanned,
        });
      });
    }

    return array;
  } catch (error) {
    throw new Error("Error trying to get all account blogs");
  }
};

// Update isVerified Account
const updateIsVerifiedAccount = async (id) => {
  try {
    const updatedAccount = await BlogAccount.update(
      {
        isVerified: true,
      },
      {
        where: {
          id,
        },
      }
    );

    if (updatedAccount[0] === 1) {
      const account = await getAccountById(id);

      return account;
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to verify account!");
  }
};

// Check if username exists
const checkUsernameExists = async (username) => {
  try {
    const usernameExists = await BlogAccount.findOne({
      where: {
        username: {
          [Op.iLike]: `@${username}`,
        },
      },
    });

    return usernameExists;
  } catch (error) {
    throw new Error("Error trying to check if username exists");
  }
};

// Update username
const updateUsername = async (id, username) => {
  try {
    const updatedAccount = await BlogAccount.update(
      {
        username: username,
      },
      {
        where: {
          id,
        },
      }
    );

    if (updatedAccount[0] === 1) {
      const account = await getAccountById(id);

      return account;
    }
  } catch (error) {
    throw new Error("Error trying to update user account username");
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
      const account = await getAccountById(id);

      return account;
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to update the user account profile image!");
  }
};

// Delete user image
const deleteUserImage = async (id) => {
  try {
    const account = await BlogAccount.findByPk(id);

    if (account.image_id === null) {
      return null;
    }

    await deleteImage(account.image_id);

    const updatedAccount = await BlogAccount.update(
      {
        image: null,
        image_id: null,
      },
      {
        where: {
          id,
        },
      }
    );

    if (updatedAccount[0] === 1) {
      const account = await getAccountById(id);

      return account;
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to delete user profile image");
  }
};

// Delete user account
const deleteUserAccount = async (id) => {
  try {
    const account = await BlogAccount.findByPk(id);

    const blogs = await getAccountBlogs(id);

    for (b of blogs) {
      const results = await usersBlogsServices.getBlogPosts(b.id);

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
      await Blog.destroy({
        where: {
          id: b.id,
        },
      });
    }

    const deletedAccount = await BlogAccount.destroy({
      where: {
        id,
      },
    });

    if (deletedAccount) {
      if (account.image_id !== null) {
        await deleteImage(account.image_id);
      }

      return deletedAccount;
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to delete user account");
  }
};

// Update user account password
const updatePassword = async (id, hash) => {
  try {
    const updatedAccount = await BlogAccount.update(
      {
        password: hash,
      },
      {
        where: {
          id,
        },
      }
    );

    if (updatedAccount[0] === 1) {
      const account = await getAccountById(id);

      return account;
    }
  } catch (error) {
    throw new Error("Error trying to update user account password");
  }
};

// Get accounts
const getAccounts = async (id, page, limit) => {
  const results = [];
  try {
    const dbResults = await BlogAccount.findAndCountAll({
      attributes: ["id", "email", "username", "isVerified", "image"],
      where: {
        id: {
          [Op.not]: id,
        },
        isAdmin: false,
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
          username: r.username,
          email: r.email,
          image: r.image,
          isVerified: r.isVerified,
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
    throw new Error("Error trying to get all accounts");
  }
};

// Get filtered accounts
const getFilteredAccounts = async (id, text, page, limit) => {
  const results = [];
  try {
    const dbResults = await BlogAccount.findAndCountAll({
      attributes: ["id", "email", "username", "isVerified", "image"],
      where: {
        id: {
          [Op.not]: id,
        },
        isAdmin: false,
        isBanned: false,
        [Op.or]: {
          username: {
            [Op.iLike]: `%${text}%`,
          },
          email: {
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
          username: r.username,
          email: r.email,
          image: r.image,
          isVerified: r.isVerified,
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
    throw new Error("Error trying to get filtered accounts");
  }
};

module.exports = {
  checkEmailExists,
  createAccount,
  getAccountById,
  createAccountFromGithubOrGoogle,
  updateIsVerifiedAccount,
  checkUsernameExists,
  updateUsername,
  updateUserImage,
  deleteUserImage,
  deleteUserAccount,
  getAccountBlogs,
  updatePassword,
  getAccounts,
  getFilteredAccounts,
};
