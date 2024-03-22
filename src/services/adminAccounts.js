const BlogAccount = require("../models/BlogAccount");

// Create account
const createAccount = async (hash, email) => {
  try {
    const accountCreated = await BlogAccount.create({
      password: hash,
      email: email.toLowerCase(),
      isAdmin: true,
    });

    return accountCreated;
  } catch (error) {
    throw new Error("Error trying to create new account");
  }
};

// Ban account
const banAccount = async (id) => {
  try {
    const updatedAccount = await BlogAccount.update(
      {
        isBanned: true,
      },
      {
        where: {
          id,
        },
      }
    );

    if (updatedAccount) {
      return updatedAccount;
    }
  } catch (error) {
    throw new Error("Error trying to ban an account");
  }
};

// Not Ban account
const notBanAccount = async (id) => {
  try {
    const updatedAccount = await BlogAccount.update(
      {
        isBanned: false,
      },
      {
        where: {
          id,
        },
      }
    );

    if (updatedAccount) {
      return updatedAccount;
    }
  } catch (error) {
    throw new Error("Error trying to ban an account");
  }
};

module.exports = {
  createAccount,
  banAccount,
  notBanAccount,
};
