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

module.exports = {
  createAccount,
};
