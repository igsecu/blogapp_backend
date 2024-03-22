const express = require("express");
const router = express.Router();

const adminAccountsController = require("../controllers/adminAccounts");
const { ensureAuthenticatedAdmin } = require("../utils");

// Create new admin account
router.post("/account", adminAccountsController.createAccount);
// Ban user account
router.put(
  "/account/:id/banned/true",
  ensureAuthenticatedAdmin,
  adminAccountsController.updateAccount
);

module.exports = router;
