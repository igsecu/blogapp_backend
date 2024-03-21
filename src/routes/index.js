const express = require("express");
const router = express.Router();

const blogRouter = require("./blogs");
const usersRouter = require("./users");
const loginRouter = require("./login");
const adminRouter = require("./admin");

// Specify routers root routes
router.use("/", loginRouter);
router.use("/users", usersRouter);
router.use("/admin", adminRouter);
/* router.use("/api", blogRouter); */

module.exports = router;
