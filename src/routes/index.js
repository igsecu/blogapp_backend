const express = require("express");
const router = express.Router();

const blogRouter = require("./blogs");

// Specify routers root routes
router.use("/api", blogRouter);

module.exports = router;
