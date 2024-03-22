const express = require("express");
const router = express.Router();

const passport = require("passport");

const usersAccountsController = require("../controllers/usersAccounts");

const { ensureAuthenticatedUser } = require("../utils/index");

const fileUpload = require("express-fileupload");

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
// Request password change
router.post("/request/password", usersAccountsController.requestPassword);
// Reset Pasword
router.post("/reset/password", usersAccountsController.resetPassword);
// Update user account username
router.put(
  "/account/username",
  ensureAuthenticatedUser,
  usersAccountsController.updateUsername
);
// Updated user account image
router.put(
  "/account/image",
  fileUpload({
    useTempFiles: true,
    tempFileDir: `${__dirname}/../../uploads`,
  }),
  ensureAuthenticatedUser,
  usersAccountsController.updateUserImage
);
// Delete user account image
router.delete(
  "/account/image",
  ensureAuthenticatedUser,
  usersAccountsController.deleteUserImage
);
// Delete account
router.delete(
  "/account",
  ensureAuthenticatedUser,
  usersAccountsController.deleteAccount
);

module.exports = router;
