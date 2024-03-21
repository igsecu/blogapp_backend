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
      type: "LOCAL",
    });

    return accountCreated;
  } catch (error) {
    throw new Error("Error trying to create new account");
  }
};

// Create account from Github or Google
const createAccountFromGithubOrGoogle = async (email, type) => {
  try {
    const accountCreated = await BlogAccount.create({
      email: email.toLowerCase(),
      type,
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
        "type",
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
        type: account.type,
        isAdmin: account.isAdmin,
      };
    }

    return account;
  } catch (error) {
    throw new Error("Error trying to get an account by its id");
  }
};

module.exports = {
  checkEmailExists,
  createAccount,
  getAccountById,
  createAccountFromGithubOrGoogle,
};
