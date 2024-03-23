const bcrypt = require("bcryptjs");

const usersAccountsServices = require("../services/usersAccounts");
const notificationsServices = require("../services/notifications");
const adminAccountsServices = require("../services/adminAccounts");

const {
  validateId,
  validatePassword,
  validateEmail,
  validatePasswordConfirmation,
  validatePage,
  validateLimit,
} = require("../utils/index");

// Create new user account
const createAccount = async (req, res, next) => {
  const { email, password, password2 } = req.body;
  try {
    // Validations
    if (validateEmail(email)) {
      return res.status(400).json({
        statusCode: 400,
        msg: validateEmail(email),
      });
    }

    const emailExist = await usersAccountsServices.checkEmailExists(email);

    if (emailExist) {
      return res.status(400).json({
        statusCode: 400,
        msg: `Email "${email}" exists! Try with another one!`,
      });
    }

    if (validatePassword(password)) {
      return res.status(400).json({
        statusCode: 400,
        msg: validatePassword(password),
      });
    }

    if (validatePasswordConfirmation(password, password2)) {
      return res.status(400).json({
        statusCode: 400,
        msg: validatePasswordConfirmation(password, password2),
      });
    }

    // Hash Password
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        if (err) {
          return next("Error trying to create a new account");
        }
        try {
          const accountCreated = await adminAccountsServices.createAccount(
            hash,
            email
          );

          if (accountCreated) {
            const account = await usersAccountsServices.getAccountById(
              accountCreated.id
            );

            await notificationsServices.createNotification(
              account.id,
              "Your account was created successfully!"
            );

            return res.status(201).json({
              statusCode: 201,
              data: account,
              msg: "Account created successfully!",
            });
          }
        } catch (error) {
          console.log(error.message);
          return next("Error trying to create a new account");
        }
      });
    });
  } catch (error) {
    console.log(error);
    return next("Error trying to create a new account");
  }
};

// Ban user account
const banAccount = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!validateId(id)) {
      return res.status(400).json({
        statusCode: 400,
        msg: `ID: ${id} - Invalid format!`,
      });
    }

    const accountFound = await usersAccountsServices.getAccountById(id);

    if (!accountFound) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Account with ID: ${id} not found!`,
      });
    }

    const updatedAccount = await adminAccountsServices.banAccount(id);

    if (updatedAccount) {
      return res.status(200).json({
        statusCode: 200,
        msg: "Account updated successfully!",
      });
    }
  } catch (error) {
    return next("Error trying to ban an account");
  }
};

// not Ban user account
const notBanAccount = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!validateId(id)) {
      return res.status(400).json({
        statusCode: 400,
        msg: `ID: ${id} - Invalid format!`,
      });
    }

    const accountFound = await usersAccountsServices.getAccountById(id);

    if (!accountFound) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Account with ID: ${id} not found!`,
      });
    }

    const updatedAccount = await adminAccountsServices.notBanAccount(id);

    if (updatedAccount) {
      return res.status(200).json({
        statusCode: 200,
        msg: "Account updated successfully!",
      });
    }
  } catch (error) {
    return next("Error trying to not ban an account");
  }
};

// Get all accounts
const getAccounts = async (req, res, next) => {
  const { page, limit } = req.query;
  try {
    if (page) {
      if (validatePage(page)) {
        return res.status(400).json({
          statusCode: 400,
          msg: "Page must be a number",
        });
      }

      if (parseInt(page) === 0) {
        return res.status(404).json({
          statusCode: 404,
          msg: `Page ${page} not found!`,
        });
      }
    }

    if (limit) {
      if (validateLimit(limit)) {
        return res.status(400).json({
          statusCode: 400,
          msg: "Limit must be a number",
        });
      }
    }

    const accounts = await adminAccountsServices.getAccounts(
      page ? page : 1,
      limit ? limit : 10
    );

    if (!accounts) {
      return res.status(404).json({
        statusCode: 404,
        msg: "No accounts saved in DB!",
      });
    }

    if (!accounts.data.length) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Page ${page} not found!`,
      });
    }

    res.status(200).json({
      statusCode: 200,
      ...accounts,
    });
  } catch (error) {
    console.log(error.message);
    throw next(error);
  }
};

// Get banned accounts
const getBannedAccounts = async (req, res, next) => {
  const { page, limit } = req.query;
  try {
    if (page) {
      if (validatePage(page)) {
        return res.status(400).json({
          statusCode: 400,
          msg: "Page must be a number",
        });
      }

      if (parseInt(page) === 0) {
        return res.status(404).json({
          statusCode: 404,
          msg: `Page ${page} not found!`,
        });
      }
    }

    if (limit) {
      if (validateLimit(limit)) {
        return res.status(400).json({
          statusCode: 400,
          msg: "Limit must be a number",
        });
      }
    }

    const accounts = await adminAccountsServices.getBannedAccounts(
      page ? page : 1,
      limit ? limit : 10
    );

    if (!accounts) {
      return res.status(404).json({
        statusCode: 404,
        msg: "No banned accounts saved in DB!",
      });
    }

    if (!accounts.data.length) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Page ${page} not found!`,
      });
    }

    res.status(200).json({
      statusCode: 200,
      ...accounts,
    });
  } catch (error) {
    console.log(error.message);
    throw next(error);
  }
};

// Get not banned accounts
const getNotBannedAccounts = async (req, res, next) => {
  const { page, limit } = req.query;
  try {
    if (page) {
      if (validatePage(page)) {
        return res.status(400).json({
          statusCode: 400,
          msg: "Page must be a number",
        });
      }

      if (parseInt(page) === 0) {
        return res.status(404).json({
          statusCode: 404,
          msg: `Page ${page} not found!`,
        });
      }
    }

    if (limit) {
      if (validateLimit(limit)) {
        return res.status(400).json({
          statusCode: 400,
          msg: "Limit must be a number",
        });
      }
    }

    const accounts = await adminAccountsServices.getNotBannedAccounts(
      page ? page : 1,
      limit ? limit : 10
    );

    if (!accounts) {
      return res.status(404).json({
        statusCode: 404,
        msg: "No not banned accounts saved in DB!",
      });
    }

    if (!accounts.data.length) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Page ${page} not found!`,
      });
    }

    res.status(200).json({
      statusCode: 200,
      ...accounts,
    });
  } catch (error) {
    console.log(error.message);
    throw next(error);
  }
};

// Get filtered accounts
const getFilteredAccounts = async (req, res, next) => {
  const { page, limit, email } = req.query;
  try {
    if (!email) {
      return res.status(400).json({
        statusCode: 400,
        msg: "Email query is missing",
      });
    }

    if (page) {
      if (validatePage(page)) {
        return res.status(400).json({
          statusCode: 400,
          msg: "Page must be a number",
        });
      }

      if (parseInt(page) === 0) {
        return res.status(404).json({
          statusCode: 404,
          msg: `Page ${page} not found!`,
        });
      }
    }

    if (limit) {
      if (validateLimit(limit)) {
        return res.status(400).json({
          statusCode: 400,
          msg: "Limit must be a number",
        });
      }
    }

    const accounts = await adminAccountsServices.getFilteredAccounts(
      email,
      page ? page : 1,
      limit ? limit : 10
    );

    if (!accounts) {
      return res.status(404).json({
        statusCode: 404,
        msg: "No accounts found!",
      });
    }

    if (!accounts.data.length) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Page ${page} not found!`,
      });
    }

    res.status(200).json({
      statusCode: 200,
      ...accounts,
    });
  } catch (error) {
    console.log(error.message);
    throw next(error);
  }
};

module.exports = {
  createAccount,
  banAccount,
  notBanAccount,
  getAccounts,
  getBannedAccounts,
  getNotBannedAccounts,
  getFilteredAccounts,
};
