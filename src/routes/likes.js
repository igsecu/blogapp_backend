const express = require("express");
const router = express.Router();

const usersLikesController = require("../controllers/usersLikes");

const { ensureAuthenticatedUser } = require("../utils/index");

// Create new like
router.post(
  "/like/post/:id",
  ensureAuthenticatedUser,
  usersLikesController.createLike
);
// Delete like
router.delete(
  "/like/post/:id",
  ensureAuthenticatedUser,
  usersLikesController.deleteLike
);

module.exports = router;
