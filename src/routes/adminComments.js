const express = require("express");
const router = express.Router();

const adminCommentsController = require("../controllers/adminComments");
const { ensureAuthenticatedAdmin } = require("../utils");

// Get comments
router.get(
  "/comments",
  ensureAuthenticatedAdmin,
  adminCommentsController.getComments
);
// Ban comment
router.put(
  "/comment/:id/banned/true",
  ensureAuthenticatedAdmin,
  adminCommentsController.banComment
);
// not Ban comment
router.put(
  "/comment/:id/banned/false",
  ensureAuthenticatedAdmin,
  adminCommentsController.notBanComment
);

module.exports = router;
