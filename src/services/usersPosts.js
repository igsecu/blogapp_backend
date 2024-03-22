const Blog = require("../models/Blog");
const BlogAccount = require("../models/BlogAccount");
const Post = require("../models/Post");

const { Op } = require("sequelize");

const { deleteImage } = require("../utils/cloudinary");

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

// Create new post
const createPost = async (title, text, blogId, image, image_id) => {
  try {
    const postCreated = await Post.create({
      title,
      text,
      blogId,
      image: image ? image : null,
      image_id: image_id ? image_id : null,
    });

    if (postCreated) {
      const post = await getPostById(postCreated.id);

      return post;
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to create new post");
  }
};

// Update post image
const updatePostImage = async (id, image, image_id) => {
  try {
    const post = await Post.findByPk(id);

    if (post.image_id !== null) {
      await deleteImage(post.image_id);
    }

    const updatedPost = await Post.update(
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

    if (updatedPost[0] === 1) {
      const post = await getPostById(id);

      return post;
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to update the post image!");
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

// Delete post image
const deletePostImage = async (id) => {
  try {
    const post = await Post.findByPk(id);

    if (post.image_id === null) {
      return null;
    }

    await deleteImage(post.image_id);

    const updatedPost = await Post.update(
      {
        image: null,
        image_id: null,
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
    throw new Error("Error trying to delete post image");
  }
};

module.exports = {
  getPostById,
  createPost,
  updatePostImage,
  updatePostText,
  updatePostTitle,
  deletePostImage,
};
