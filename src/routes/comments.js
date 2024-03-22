const express = require("express");
const router = express.Router();

const usersCommentsController = require("../controllers/usersComments");

const { ensureAuthenticatedUser } = require("../utils/index");

// Create new comment
router.post(
  "/comment",
  ensureAuthenticatedUser,
  usersCommentsController.createComment
);

module.exports = router;
