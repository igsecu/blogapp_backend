const BlogAccount = require("../models/BlogAccount");

const { Op } = require("sequelize");

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

// Get accounts
const getAccounts = async (page, limit) => {
  const results = [];
  try {
    const accounts = await BlogAccount.findAndCountAll({
      attributes: [
        "id",
        "email",
        "username",
        "isBanned",
        "isVerified",
        "isAdmin",
        "image",
      ],
      where: {
        isAdmin: false,
      },
      order: [["createdAt", "DESC"]],
      limit,
      offset: page * limit - limit,
    });

    if (accounts.count === 0) {
      return false;
    }

    if (accounts.rows.length > 0) {
      accounts.rows.forEach((r) => {
        results.push({
          id: r.id,
          email: r.email,
          username: r.username,
          isBanned: r.isBanned,
          isVerified: r.isVerified,
          isAdmin: r.isAdmin,
          image: r.image,
        });
      });

      return {
        totalResults: accounts.count,
        totalPages: Math.ceil(accounts.count / limit),
        page: parseInt(page),
        data: results,
      };
    } else {
      return { data: [] };
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to get all accounts");
  }
};

// Get banned accounts
const getBannedAccounts = async (page, limit) => {
  const results = [];
  try {
    const accounts = await BlogAccount.findAndCountAll({
      attributes: [
        "id",
        "email",
        "username",
        "isBanned",
        "isVerified",
        "isAdmin",
        "image",
      ],
      where: {
        isAdmin: false,
        isBanned: true,
      },
      order: [["createdAt", "DESC"]],
      limit,
      offset: page * limit - limit,
    });

    if (accounts.count === 0) {
      return false;
    }

    if (accounts.rows.length > 0) {
      accounts.rows.forEach((r) => {
        results.push({
          id: r.id,
          email: r.email,
          username: r.username,
          isBanned: r.isBanned,
          isVerified: r.isVerified,
          isAdmin: r.isAdmin,
          image: r.image,
        });
      });

      return {
        totalResults: accounts.count,
        totalPages: Math.ceil(accounts.count / limit),
        page: parseInt(page),
        data: results,
      };
    } else {
      return { data: [] };
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to get banned accounts");
  }
};

// Get not banned accounts
const getNotBannedAccounts = async (page, limit) => {
  const results = [];
  try {
    const accounts = await BlogAccount.findAndCountAll({
      attributes: [
        "id",
        "email",
        "username",
        "isBanned",
        "isVerified",
        "isAdmin",
        "image",
      ],
      where: {
        isAdmin: false,
        isBanned: false,
      },
      order: [["createdAt", "DESC"]],
      limit,
      offset: page * limit - limit,
    });

    if (accounts.count === 0) {
      return false;
    }

    if (accounts.rows.length > 0) {
      accounts.rows.forEach((r) => {
        results.push({
          id: r.id,
          email: r.email,
          username: r.username,
          isBanned: r.isBanned,
          isVerified: r.isVerified,
          isAdmin: r.isAdmin,
          image: r.image,
        });
      });

      return {
        totalResults: accounts.count,
        totalPages: Math.ceil(accounts.count / limit),
        page: parseInt(page),
        data: results,
      };
    } else {
      return { data: [] };
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to get not banned accounts");
  }
};

module.exports = {
  createAccount,
  banAccount,
  notBanAccount,
  getAccounts,
  getBannedAccounts,
  getNotBannedAccounts,
};
