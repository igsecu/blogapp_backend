const express = require("express");
const app = express();

const PORT = process.env.PORT || 5000;

const router = require("./src/routes/index");

const db = require("./src/database/db");

const session = require("express-session");
const passport = require("passport");

// Database models
const Blog = require("./src/models/Blog");
const Comment = require("./src/models/Comment");
const Like = require("./src/models/Like");
const Notification = require("./src/models/Notification");
const Post = require("./src/models/Post");
const BlogAccount = require("./src/models/BlogAccount");
const Token = require("./src/models/Token");

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

// Body-Parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Express Session Middleware
app.use(
  session({
    secret: `${process.env.SESSION_SECRET}`,
    resave: false,
    saveUninitialized: false,
  })
);

// Passport Config
require("./src/config/passport")(passport);
app.use(passport.initialize());
app.use(passport.session());

// Res Headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

// Router middleware
app.use("/api", router);

// Error catching endware
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || err;
  res.status(status).json({
    statusCode: status,
    msg: message,
  });
});

// Initialized Express Server
db.sync({}).then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
  });
});

module.exports = app;
