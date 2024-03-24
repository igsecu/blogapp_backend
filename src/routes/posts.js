const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");

const usersPostsController = require("../controllers/usersPosts");

const { ensureAuthenticatedUser } = require("../utils/index");

// Get Post by Id
router.get(
  "/post/:id",
  ensureAuthenticatedUser,
  usersPostsController.getPostById
);
// Get Blogs posts
router.get(
  "/posts/blog/:id",
  ensureAuthenticatedUser,
  usersPostsController.getBlogPosts
);
// Get filtered posts
router.get(
  "/posts/filter",
  ensureAuthenticatedUser,
  usersPostsController.getFilteredPosts
);
// Get posts
router.get("/posts", ensureAuthenticatedUser, usersPostsController.getPosts);
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
// Delete post
router.delete(
  "/post/:id",
  ensureAuthenticatedUser,
  usersPostsController.deletePost
);

module.exports = router;
