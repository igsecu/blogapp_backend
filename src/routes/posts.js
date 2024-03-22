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

module.exports = router;
