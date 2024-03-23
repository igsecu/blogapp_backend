const express = require("express");
const router = express.Router();

const passport = require("passport");

const usersBlogsController = require("../controllers/usersBlogs");

const { ensureAuthenticatedUser } = require("../utils/index");

// Get logged in account blogs
router.get(
  "/blogs/account/auth",
  ensureAuthenticatedUser,
  usersBlogsController.getOwnBlogs
);
// Get account blogs
router.get(
  "/blogs/account/:id",
  ensureAuthenticatedUser,
  usersBlogsController.getAccountBlogs
);
// Get filtered blogs by name
router.get(
  "/blogs/filter",
  ensureAuthenticatedUser,
  usersBlogsController.getFilteredBlogs
);
// Get all blogs
router.get("/blogs", ensureAuthenticatedUser, usersBlogsController.getBlogs);
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
