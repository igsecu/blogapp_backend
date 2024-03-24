const express = require("express");
const router = express.Router();

const usersCommentsController = require("../controllers/usersComments");

const { ensureAuthenticatedUser } = require("../utils/index");

// Get posts comments
router.get(
  "/comments/post/:id",
  ensureAuthenticatedUser,
  usersCommentsController.getPostComments
);
// Create new comment
router.post(
  "/comment",
  ensureAuthenticatedUser,
  usersCommentsController.createComment
);

module.exports = router;
