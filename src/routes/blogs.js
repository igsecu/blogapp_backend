const express = require("express");
const router = express.Router();

const Blog = require("../models/Blog");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const Like = require("../models/Like");
const BlogAccount = require("../models/BlogAccount");

module.exports = router;
