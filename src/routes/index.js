const express = require("express");
const router = express.Router();

const blogsRouter = require("./blogs");
const usersRouter = require("./users");
const loginRouter = require("./login");
const postsRouter = require("./posts");
const commentsRouter = require("./comments");
const likesRouter = require("./likes");
const notificationsRouter = require("./notifications");

const adminRouter = require("./admin");
const adminBlogsRouter = require("./adminBlogs");
const adminPostsRouter = require("./adminPosts");
const adminCommentsRouter = require("./adminComments");

// Specify routers root routes
router.use("/", loginRouter);
router.use("/users", usersRouter);
router.use("/users", blogsRouter);
router.use("/users", postsRouter);
router.use("/users", commentsRouter);
router.use("/users", likesRouter);
router.use("/users", notificationsRouter);

router.use("/admin", adminRouter);
router.use("/admin", adminBlogsRouter);
router.use("/admin", adminPostsRouter);
router.use("/admin", adminCommentsRouter);

module.exports = router;
