const express = require("express");
const router = express.Router();

const usersLikesController = require("../controllers/usersLikes");

const { ensureAuthenticatedUser } = require("../utils/index");

// Create new comment
router.post(
  "/comment",
  ensureAuthenticatedUser,
  usersCommentsController.createComment
);

module.exports = router;
