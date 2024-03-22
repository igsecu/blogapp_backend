const express = require("express");
const router = express.Router();

const passport = require("passport");

const usersBlogsController = require("../controllers/usersBlogs");

const { ensureAuthenticatedUser } = require("../utils/index");

// Create new blog
router.post("/blog", ensureAuthenticatedUser, usersBlogsController.createBlog);

module.exports = router;
