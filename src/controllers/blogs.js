const { Op } = require("sequelize");

const Blog = require("../models//Blog");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const Like = require("../models/Like");
const BlogAccount = require("../models/BlogAccount");

const { deleteImage } = require("../utils/cloudinary");

// Get account by id
const getBlogAccountById = async (id) => {
  try {
    const account = await BlogAccount.findByPk(id, {
      attributes: [
        "id",
        "email",
        "username",
        "isBanned",
        "isVerified",
        "image",
        "type",
      ],
    });

    if (account) {
      return {
        id: account.id,
        email: account.email,
        username: account.username,
        isBanned: account.isBanned,
        isVerified: account.isVerified,
        image: account.image,
        type: account.type,
      };
    }

    return account;
  } catch (error) {
    throw new Error("Error trying to get an account by its id");
  }
};

// Update user image
const updateUserImage = async (id, image, image_id) => {
  try {
    const account = await BlogAccount.findByPk(id);

    if (account.image_id !== null) {
      await deleteImage(account.image_id);
    }

    const updatedAccount = await BlogAccount.update(
      {
        image,
        image_id,
      },
      {
        where: {
          id,
        },
      }
    );

    if (updatedAccount[0] === 1) {
      const account = await getBlogAccountById(id);

      return account;
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to update the user account profile image!");
  }
};

// Update user account username
const updateUsername = async (id, username) => {
  try {
    const updatedAccount = await BlogAccount.update(
      {
        username,
      },
      {
        where: {
          id,
        },
      }
    );

    if (updatedAccount[0] === 1) {
      const account = await getBlogAccountById(id);

      return account;
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to update the user account username!");
  }
};

// Update user account isVerified
const updateIsVerifiedAccount = async (id) => {
  try {
    const updatedAccount = await BlogAccount.update(
      {
        isVerified: true,
      },
      {
        where: {
          id,
        },
      }
    );

    if (updatedAccount[0] === 1) {
      const account = await getBlogAccountById(id);

      return account;
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to verify account!");
  }
};

// Get blog by id
const getBlogById = async (id) => {
  try {
    const dbResult = await Blog.findByPk(id, {
      attributes: ["id", "name", "isBanned"],
      include: {
        model: BlogAccount,
        attributes: ["id", "email", "username", "isBanned"],
      },
    });

    if (dbResult) {
      return {
        id: dbResult.id,
        name: dbResult.name,
        isBanned: dbResult.isBanned,
        account: {
          id: dbResult.blogAccount.id,
          email: dbResult.blogAccount.email,
          username: dbResult.blogAccount.username,
          isBanned: dbResult.blogAccount.isBanned,
        },
      };
    }

    return dbResult;
  } catch (error) {
    throw new Error("Error trying to get a blog by its id");
  }
};

// Get post by id
const getPostById = async (id) => {
  try {
    const result = await Post.findByPk(id, {
      attributes: [
        "id",
        "title",
        "text",
        "isBanned",
        "readers",
        "comments_number",
        "likes_number",
        "image",
      ],
      include: [
        {
          model: Blog,
          attributes: ["id", "name", "isBanned"],
          include: {
            model: BlogAccount,
            attributes: ["id", "username", "email", "isBanned"],
          },
        },
      ],
    });

    if (result) {
      return {
        id: result.id,
        title: result.title,
        text: result.text,
        isBanned: result.isBanned,
        readers: result.readers,
        likes: result.likes_number,
        comments: result.comments_number,
        image: result.image,
        blog: {
          id: result.blog.id,
          name: result.blog.name,
          isBanned: result.blog.isBanned,
          account: {
            id: result.blog.blogAccount.id,
            username: result.blog.blogAccount.username,
            image: result.blog.blogAccount.image,
            isBanned: result.blog.blogAccount.isBanned,
          },
        },
      };
    }

    return result;
  } catch (error) {
    throw new Error("Error trying to get a post by its id");
  }
};

// Update blog name
const updateBlogName = async (id, name) => {
  try {
    const updatedBlog = await Blog.update(
      {
        name,
      },
      {
        where: {
          id,
        },
      }
    );

    if (updatedBlog[0] === 1) {
      const blog = await getBlogById(id);

      return blog;
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to update blog name!");
  }
};

// Update post title
const updatePostTitle = async (id, title) => {
  try {
    const updatedPost = await Post.update(
      {
        title,
      },
      {
        where: {
          id,
        },
      }
    );

    if (updatedPost[0] === 1) {
      const post = await getPostById(id);

      return post;
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to update post title!");
  }
};

// Update post text
const updatePostText = async (id, text) => {
  try {
    const updatedPost = await Post.update(
      {
        text,
      },
      {
        where: {
          id,
        },
      }
    );

    if (updatedPost[0] === 1) {
      const post = await getPostById(id);

      return post;
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to update post text!");
  }
};

module.exports = {
  getBlogAccountById,
  updateUserImage,
  updateUsername,
  updateIsVerifiedAccount,
  getBlogById,
  updateBlogName,
  getPostById,
  updatePostText,
  updatePostTitle,
};
