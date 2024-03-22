const express = require("express");
const router = express.Router();

const blogsRouter = require("./blogs");
const usersRouter = require("./users");
const loginRouter = require("./login");
const adminRouter = require("./admin");

// Specify routers root routes
router.use("/", loginRouter);
router.use("/users", usersRouter);
router.use("/users", blogsRouter);
router.use("/admin", adminRouter);

module.exports = router;
