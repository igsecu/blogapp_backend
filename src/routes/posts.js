const express = require("express");
const router = express.Router();

const passport = require("passport");

const usersPostsController = require("../controllers/usersPosts");

const { ensureAuthenticatedUser } = require("../utils/index");

module.exports = router;
