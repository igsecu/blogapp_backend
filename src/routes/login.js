const express = require("express");
const router = express.Router();

const loginController = require("../controllers/login");

// Logout process
router.get("/logout", loginController.logout);
// Get logged in account
router.get("/account", loginController.getLoggedInAccount);
// Login route
router.post("/login", loginController.login);

module.exports = router;
