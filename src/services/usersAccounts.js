const { Op } = require("sequelize");
const BlogAccount = require("../models/BlogAccount");

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
        username: username.trim(),
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

module.exports = {
  checkEmailExists,
  createAccount,
  getAccountById,
  createAccountFromGithubOrGoogle,
  updateIsVerifiedAccount,
  checkUsernameExists,
  updateUsername,
};
