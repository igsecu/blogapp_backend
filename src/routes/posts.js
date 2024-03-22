const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");

const usersPostsController = require("../controllers/usersPosts");

const { ensureAuthenticatedUser } = require("../utils/index");

// Create new post
router.post(
  "/post",
  fileUpload({
    useTempFiles: true,
    tempFileDir: `${__dirname}/../../uploads`,
  }),
  ensureAuthenticatedUser,
  usersPostsController.createPost
);
// Update post image
router.put(
  "/post/:id/image",
  fileUpload({
    useTempFiles: true,
    tempFileDir: `${__dirname}/../../uploads`,
  }),
  ensureAuthenticatedUser,
  usersPostsController.updatePostImage
);
// Update post
router.put(
  "/post/:id",
  ensureAuthenticatedUser,
  usersPostsController.updatePost
);
// Delete post image
router.delete(
  "/post/:id/image",
  ensureAuthenticatedUser,
  usersPostsController.deletePostImage
);

module.exports = router;
