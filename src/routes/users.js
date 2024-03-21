const express = require("express");
const router = express.Router();

const passport = require("passport");

const usersAccountsController = require("../controllers/usersAccounts");

// Github Callback
router.get(
  "/auth/github/callback",
  passport.authenticate("github"),
  usersAccountsController.githubCallback
);
// Github Authentication
router.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);
// Google Callback
router.get(
  "/auth/google/callback",
  passport.authenticate("google"),
  usersAccountsController.googleCallback
);
// Google Authentication
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
// Verify account
router.get("/account/:id/verify", usersAccountsController.verifyAccount);
// Create new user account
router.post("/account", usersAccountsController.createAccount);

module.exports = router;
