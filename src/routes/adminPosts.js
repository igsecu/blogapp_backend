const express = require("express");
const router = express.Router();

const adminPostsController = require("../controllers/adminPosts");
const { ensureAuthenticatedAdmin } = require("../utils");

// Get filtered posts
router.get(
  "/posts/filter",
  ensureAuthenticatedAdmin,
  adminPostsController.getFilteredPosts
);
// Get all posts
router.get("/posts", ensureAuthenticatedAdmin, adminPostsController.getPosts);
// Ban post
router.put(
  "/post/:id/banned/true",
  ensureAuthenticatedAdmin,
  adminPostsController.banPost
);
// not Ban post
router.put(
  "/post/:id/banned/false",
  ensureAuthenticatedAdmin,
  adminPostsController.notBanPost
);

module.exports = router;
