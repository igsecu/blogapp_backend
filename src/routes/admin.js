const express = require("express");
const router = express.Router();

const adminAccountsController = require("../controllers/adminAccounts");
const { ensureAuthenticatedAdmin } = require("../utils");

// Get all accounts
router.get(
  "/accounts",
  ensureAuthenticatedAdmin,
  adminAccountsController.getAccounts
);
// Create new admin account
router.post("/account", adminAccountsController.createAccount);
// Ban user account
router.put(
  "/account/:id/banned/true",
  ensureAuthenticatedAdmin,
  adminAccountsController.banAccount
);
router.put(
  "/account/:id/banned/false",
  ensureAuthenticatedAdmin,
  adminAccountsController.notBanAccount
);

module.exports = router;
