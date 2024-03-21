const express = require("express");
const router = express.Router();

const adminAccountsController = require("../controllers/adminAccounts");

// Create new admin account
router.post("/account", adminAccountsController.createAccount);

module.exports = router;
