const express = require("express");
const router = express.Router();

const usersAccountsController = require("../controllers/usersAccounts");

// Create new user account
router.post("/account", usersAccountsController.createAccount);

module.exports = router;
