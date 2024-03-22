const express = require("express");
const router = express.Router();

const usersCommentsController = require("../controllers/usersBlogs");

const { ensureAuthenticatedUser } = require("../utils/index");

module.exports = router;
