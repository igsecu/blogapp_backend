const express = require("express");
const router = express.Router();

const passport = require("passport");

const usersBlogsController = require("../controllers/usersBlogs");

const { ensureAuthenticatedUser } = require("../utils/index");

// Create new blog
router.post("/blog", ensureAuthenticatedUser, usersBlogsController.createBlog);
// Update blog name
router.put(
  "/blog/:id",
  ensureAuthenticatedUser,
  usersBlogsController.updateBlogName
);
// Delete blog
router.delete(
  "/blog/:id",
  ensureAuthenticatedUser,
  usersBlogsController.deleteBlog
);

module.exports = router;
