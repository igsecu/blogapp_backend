const fsExtra = require("fs-extra");

const notificationsServices = require("../services/notifications");
const usersPostsServices = require("../services/usersPosts");
const usersBlogsServices = require("../services/usersBlogs");

const {
  validateId,
  validateName,
  validateText,
  validateTitle,
  validateFileType,
  validateImageSize,
  validatePage,
  validateLimit,
} = require("../utils/index");

const { uploadPostImage } = require("../utils/cloudinary");

// Create new post
const createPost = async (req, res, next) => {
  const { title, text, blogId } = req.body;

  try {
    if (validateTitle(title)) {
      return res.status(400).json({
        statusCode: 400,
        msg: validateTitle(title),
      });
    }

    if (validateText(text)) {
      return res.status(400).json({
        statusCode: 400,
        msg: validateText(text),
      });
    }

    if (!blogId) {
      return res.status(400).json({
        statusCode: 400,
        msg: "blogId is missing",
      });
    }

    if (!validateId(blogId)) {
      return res.status(400).json({
        statusCode: 400,
        msg: `blogId: ${blogId} - Invalid format!`,
      });
    }

    const blog = await usersBlogsServices.getBlogById(blogId);

    if (!blog) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Blog with ID: ${blogId} not found!`,
      });
    }

    if (blog.account.id !== req.user.id) {
      return res.status(400).json({
        statusCode: 400,
        msg: "This blog is not yours! You can not create a new post...",
      });
    }

    if (blog.isBanned === true) {
      return res.status(400).json({
        statusCode: 400,
        msg: "This blog is banned! You can not create a post...",
      });
    }

    if (req.files?.image) {
      if (await validateFileType(req.files.image.tempFilePath)) {
        const message = await validateFileType(req.files.image.tempFilePath);

        await fsExtra.unlink(req.files.image.tempFilePath);

        return res.status(400).json({
          statusCode: 400,
          msg: message,
        });
      }

      if (await validateImageSize(req.files.image.tempFilePath)) {
        const message = await validateImageSize(req.files.image.tempFilePath);

        await fsExtra.unlink(req.files.image.tempFilePath);

        return res.status(400).json({
          statusCode: 400,
          msg: message,
        });
      }

      const result = await uploadPostImage(req.files.image.tempFilePath);

      await fsExtra.unlink(req.files.image.tempFilePath);

      const postCreated = await usersPostsServices.createPost(
        title,
        text,
        blogId,
        result.secure_url,
        result.public_id
      );

      if (postCreated) {
        await notificationsServices.createNotification(
          req.user.id,
          `Your post ${postCreated.title} was created successfully!`
        );

        res.status(201).json({
          statusCode: 201,
          msg: "Post created successfully!",
          data: postCreated,
        });
      }
    } else {
      const postCreated = await usersPostsServices.createPost(
        title,
        text,
        blogId
      );

      if (postCreated) {
        await notificationsServices.createNotification(
          req.user.id,
          `Your post ${postCreated.title} was created successfully!`
        );

        res.status(201).json({
          statusCode: 201,
          msg: "Post created successfully!",
          data: postCreated,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return next("Error trying to create new post");
  }
};

// Update post image
const updatePostImage = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!validateId(id)) {
      return res.status(400).json({
        statusCode: 400,
        msg: `ID: ${id} - Invalid format!`,
      });
    }

    const post = await usersPostsServices.getPostById(id);

    if (!post) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Post with ID: ${id} not found!`,
      });
    }

    if (post.blog.account.id !== req.user.id) {
      return res.status(400).json({
        statusCode: 400,
        msg: "You can not update a post that is not yours!",
      });
    }

    if (post.isBanned === true) {
      return res.status(400).json({
        statusCode: 400,
        msg: "This post is banned! You can not update it...",
      });
    }

    if (req.files?.image) {
      if (await validateFileType(req.files.image.tempFilePath)) {
        const message = await validateFileType(req.files.image.tempFilePath);

        await fsExtra.unlink(req.files.image.tempFilePath);

        return res.status(400).json({
          statusCode: 400,
          msg: message,
        });
      }

      if (await validateImageSize(req.files.image.tempFilePath)) {
        const message = await validateImageSize(req.files.image.tempFilePath);

        await fsExtra.unlink(req.files.image.tempFilePath);

        return res.status(400).json({
          statusCode: 400,
          msg: message,
        });
      }

      const result = await uploadPostImage(req.files.image.tempFilePath);

      await fsExtra.unlink(req.files.image.tempFilePath);

      const postUpdated = await usersPostsServices.updatePostImage(
        id,
        result.secure_url,
        result.public_id
      );

      return res.status(200).json({
        statusCode: 200,
        msg: "Post image was updated successfully!",
        data: postUpdated,
      });
    } else {
      return res.status(400).json({
        statusCode: 400,
        msg: "Image file is missing!",
      });
    }
  } catch (error) {
    await fsExtra.unlink(req.files.image.tempFilePath);
    console.log(error.message);
    return next(error);
  }
};

// Update post
const updatePost = async (req, res, next) => {
  const { title, text } = req.query;
  const { id } = req.params;

  let postUpdated;

  try {
    if (!validateId(id)) {
      return res.status(400).json({
        statusCode: 400,
        msg: `ID: ${id} - Invalid format!`,
      });
    }

    const post = await usersPostsServices.getPostById(id);

    if (!post) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Post with ID: ${id} not found!`,
      });
    }

    if (post.blog.account.id !== req.user.id) {
      return res.status(400).json({
        statusCode: 400,
        msg: "You can not update a post that is not yours!",
      });
    }

    if (post.isBanned === true) {
      return res.status(400).json({
        statusCode: 400,
        msg: "This post is banned! You can not update it...",
      });
    }

    if (title) {
      postUpdated = await usersPostsServices.updatePostTitle(id, title);
    }

    if (text) {
      postUpdated = await usersPostsServices.updatePostText(id, text);
    }

    if (!title && !text) {
      return res.status(400).json({
        statusCode: 400,
        msg: "Query parameter is missing",
      });
    }

    res.status(200).json({
      statusCode: 200,
      msg: "Post updated successfully!",
      data: postUpdated,
    });
  } catch (error) {
    console.log(error);
    return next("Error trying to update post");
  }
};

// Delete Post Image
const deletePostImage = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!validateId(id)) {
      return res.status(400).json({
        statusCode: 400,
        msg: `ID: ${id} - Invalid format!`,
      });
    }

    const post = await usersPostsServices.getPostById(id);

    if (!post) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Post with ID: ${id} not found!`,
      });
    }

    if (post.blog.account.id !== req.user.id) {
      return res.status(400).json({
        statusCode: 400,
        msg: "You can not delete a post image that is not yours!",
      });
    }

    const postToDelete = await usersPostsServices.deletePostImage(id);

    if (postToDelete === null) {
      return res.status(400).json({
        statusCode: 400,
        msg: "The post does not have an image to delete!",
      });
    }
    return res.status(200).json({
      statusCode: 200,
      msg: "Post image deleted successfully!",
      data: postToDelete,
    });
  } catch (error) {
    return next("Error trying to delete post image");
  }
};

// Delete post
const deletePost = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!validateId(id)) {
      return res.status(400).json({
        statusCode: 400,
        msg: `ID: ${id} - Invalid format!`,
      });
    }

    const post = await usersPostsServices.getPostById(id);

    if (!post) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Post with ID: ${id} not found!`,
      });
    }

    if (post.blog.account.id !== req.user.id) {
      return res.status(400).json({
        statusCode: 400,
        msg: "You can not delete a post that is not yours!",
      });
    }

    const postToDelete = await usersPostsServices.deletePost(id);

    if (postToDelete) {
      await notificationsServices.createNotification(
        req.user.id,
        `Post: ${post.title} was deleted successfully!`
      );

      return res.status(200).json({
        statusCode: 200,
        msg: "Post deleted successfully!",
        data: postToDelete,
      });
    }
  } catch (error) {
    return next("Error trying to delete a post");
  }
};

// Get posts
const getPosts = async (req, res, next) => {
  const { page, limit } = req.query;
  try {
    if (page) {
      if (validatePage(page)) {
        return res.status(400).json({
          statusCode: 400,
          msg: "Page must be a number",
        });
      }

      if (parseInt(page) === 0) {
        return res.status(404).json({
          statusCode: 404,
          msg: `Page ${page} not found!`,
        });
      }
    }

    if (limit) {
      if (validateLimit(limit)) {
        return res.status(400).json({
          statusCode: 400,
          msg: "Limit must be a number",
        });
      }
    }

    const posts = await usersPostsServices.getPosts(
      req.user.id,
      page ? page : 1,
      limit ? limit : 10
    );

    if (!posts) {
      return res.status(404).json({
        statusCode: 404,
        msg: "No posts saved in DB",
      });
    }

    if (!posts.data.length) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Page ${page} not found!`,
      });
    }

    res.status(200).json({
      statusCode: 200,
      ...posts,
    });
  } catch (error) {
    return next(error);
  }
};

// Get filtered posts
const getFilteredPosts = async (req, res, next) => {
  const { text, page, limit } = req.query;
  try {
    if (!text) {
      return res.status(400).json({
        statusCode: 400,
        msg: "Text query parameter is missing",
      });
    }

    if (page) {
      if (validatePage(page)) {
        return res.status(400).json({
          statusCode: 400,
          msg: "Page must be a number",
        });
      }

      if (parseInt(page) === 0) {
        return res.status(404).json({
          statusCode: 404,
          msg: `Page ${page} not found!`,
        });
      }
    }

    if (limit) {
      if (validateLimit(limit)) {
        return res.status(400).json({
          statusCode: 400,
          msg: "Limit must be a number",
        });
      }
    }

    const posts = await usersPostsServices.getFilteredPosts(
      req.user.id,
      text,
      page ? page : 1,
      limit ? limit : 10
    );

    if (!posts) {
      return res.status(404).json({
        statusCode: 404,
        msg: `No posts with text: ${text} found!`,
      });
    }

    if (!posts.data.length) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Page ${page} not found!`,
      });
    }

    res.status(200).json({
      statusCode: 200,
      ...posts,
    });
  } catch (error) {
    return next(error);
  }
};

// Get blog posts
const getBlogPosts = async (req, res, next) => {
  const { page, limit } = req.query;
  const { id } = req.params;
  try {
    if (!validateId(id)) {
      return res.status(400).json({
        statusCode: 400,
        msg: `Id: ${id} - Invalid format!`,
      });
    }

    const blog = await usersBlogsServices.getBlogById(id);

    if (!blog) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Blog with ID: ${id} not found!`,
      });
    }

    if (blog.isBanned === true) {
      return res.status(400).json({
        statusCode: 400,
        msg: "This blog is banned! You can not access to it...",
      });
    }

    if (blog.account.isBanned === true) {
      return res.status(400).json({
        statusCode: 400,
        msg: "The account of the blog is banned! You can not access to it...",
      });
    }

    if (page) {
      if (validatePage(page)) {
        return res.status(400).json({
          statusCode: 400,
          msg: "Page must be a number",
        });
      }

      if (parseInt(page) === 0) {
        return res.status(404).json({
          statusCode: 404,
          msg: `Page ${page} not found!`,
        });
      }
    }

    if (limit) {
      if (validateLimit(limit)) {
        return res.status(400).json({
          statusCode: 400,
          msg: "Limit must be a number",
        });
      }
    }

    let posts;

    if (blog.account.id === req.user.id) {
      posts = await usersPostsServices.getOwnBlogPosts(
        id,
        page ? page : 1,
        limit ? limit : 10
      );
    } else {
      posts = await usersPostsServices.getBlogPosts(
        id,
        page ? page : 1,
        limit ? limit : 10
      );
    }

    if (!posts) {
      return res.status(404).json({
        statusCode: 404,
        msg: `This blog does not have posts!`,
      });
    }

    if (!posts.data.length) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Page ${page} not found!`,
      });
    }

    res.status(200).json({
      statusCode: 200,
      ...posts,
    });
  } catch (error) {
    return next(error);
  }
};

// Get post by id
const getPostById = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!validateId(id)) {
      return res.status(400).json({
        statusCode: 400,
        msg: `ID: ${id} - Invalid format!`,
      });
    }

    const post = await usersPostsServices.getPostById(id);

    if (!post) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Post with ID: ${id} not found!`,
      });
    }

    if (post.isBanned === true && post.blog.account.id !== req.user.id) {
      return res.status(400).json({
        statusCode: 400,
        msg: "This post is banned! You can not access to it...",
      });
    }

    if (post.blog.isBanned === true && post.blog.account.id !== req.user.id) {
      return res.status(400).json({
        statusCode: 400,
        msg: "The blog of the post is banned! You can not access to it...",
      });
    }

    if (post.blog.account.isBanned === true) {
      return res.status(400).json({
        statusCode: 400,
        msg: "The account of the post is banned! You can not access to it...",
      });
    }

    if (post.blog.account.id !== req.user.id) {
      await usersPostsServices.incrementReader(id);
    }

    res.status(200).json({
      statusCode: 200,
      data: post,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createPost,
  updatePostImage,
  updatePost,
  deletePostImage,
  deletePost,
  getPosts,
  getFilteredPosts,
  getBlogPosts,
  getPostById,
};
