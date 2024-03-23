const express = require("express");
const router = express.Router();

const adminBlogsController = require("../controllers/adminBlogs");
const { ensureAuthenticatedAdmin } = require("../utils");

// Get all blogs
router.get("/blogs", ensureAuthenticatedAdmin, adminBlogsController.getBlogs);
// Ban blog
router.put(
  "/blog/:id/banned/true",
  ensureAuthenticatedAdmin,
  adminBlogsController.banBlog
);
router.put(
  "/blog/:id/banned/false",
  ensureAuthenticatedAdmin,
  adminBlogsController.notBanBlog
);

module.exports = router;
