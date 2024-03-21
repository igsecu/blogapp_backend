const db = require("./db");

// Database models
const Blog = require("./models/Blog");
const Comment = require("./models/Comment");
const Like = require("./models/Like");
const Notification = require("./models/Notification");
const Post = require("./models/Post");
const BlogAccount = require("./models/BlogAccount");
const Token = require("./models/Token");

BlogAccount.hasMany(Blog);
Blog.belongsTo(BlogAccount);

Blog.hasMany(Post);
Post.belongsTo(Blog);

BlogAccount.hasMany(Like);
Like.belongsTo(BlogAccount);

Post.hasMany(Like);
Like.belongsTo(Post);

BlogAccount.hasMany(Notification);
Notification.belongsTo(BlogAccount);

Post.hasMany(Comment);
Comment.belongsTo(Post);

BlogAccount.hasMany(Comment);
Comment.belongsTo(BlogAccount);

BlogAccount.hasOne(Token);
Token.belongsTo(BlogAccount);

module.exports = db;
