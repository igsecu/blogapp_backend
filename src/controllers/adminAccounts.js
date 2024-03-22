const bcrypt = require("bcryptjs");

const usersAccountsServices = require("../services/usersAccounts");
const notificationsServices = require("../services/notifications");
const adminAccountsServices = require("../services/adminAccounts");

const {
  validateId,
  validatePassword,
  validateEmail,
  validatePasswordConfirmation,
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
const updateAccount = async (req, res, next) => {
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

module.exports = {
  createAccount,
  banAccount,
};
