const notificationsServices = require("../services/notifications");
const usersBlogsServices = require("../services/usersBlogs");

const {
  validateId,
  validateName,
  validateText,
  validateTitle,
} = require("../utils/index");

// Create new blog
const createBlog = async (req, res, next) => {
  const { name } = req.body;

  if (validateName(name)) {
    return res.status(400).json({
      statusCode: 400,
      msg: validateName(name),
    });
  }

  try {
    const blogFound = await usersBlogsServices.checkBlogExists(name);

    if (blogFound) {
      return res.status(400).json({
        statusCode: 400,
        msg: `Blog with name: ${name} exists! Try with another one...`,
      });
    }

    const blogCreated = await usersBlogsServices.createBlog(req.user.id, name);

    if (blogCreated) {
      await notificationsServices.createNotification(
        req.user.id,
        `Blog "${blogCreated.name}" was created successfully!`
      );

      res.status(201).json({
        statusCode: 201,
        msg: "Blog created successfull!",
        data: blogCreated,
      });
    }
  } catch (error) {
    console.log(error.message);
    return next("Error trying to create a new blog");
  }
};

// Update blog name
const updateBlogName = async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    if (!validateId(id)) {
      return res.status(400).json({
        statusCode: 400,
        msg: `ID: ${id} - Invalid format!`,
      });
    }

    const blog = await usersBlogsServices.getBlogById(id);

    if (!blog) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Blog with ID: ${id} not found!`,
      });
    }

    if (blog.account.id !== req.user.id) {
      return res.status(400).json({
        statusCode: 400,
        msg: "You can not update a blog that is not yours!",
      });
    }

    if (blog.isBanned === true) {
      return res.status(400).json({
        statusCode: 400,
        msg: "This blog is banned! You can not update its name...",
      });
    }

    if (validateName(name)) {
      return res.status(400).json({
        statusCode: 400,
        msg: validateName(name),
      });
    }

    const blogFound = await usersBlogsServices.checkBlogExists(name);

    if (blogFound) {
      return res.status(400).json({
        statusCode: 400,
        msg: `Blog with name: ${name} exists! Try with another one...`,
      });
    }

    const updatedBlog = await usersBlogsServices.updateBlogName(id, name);

    if (updatedBlog) {
      await notificationsServices.createNotification(
        req.user.id,
        "The name of the blog was updated successfully!"
      );

      return res.status(200).json({
        statusCode: 200,
        msg: "Blog updated successfully!",
        data: updatedBlog,
      });
    }
  } catch (error) {
    console.log(error);
    return next("Error trying to update blog name");
  }
};

// Delete blog
const deleteBlog = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!validateId(id)) {
      return res.status(400).json({
        statusCode: 400,
        msg: `ID: ${id} - Invalid format!`,
      });
    }

    const blog = await usersBlogsServices.getBlogById(id);

    if (!blog) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Blog with ID: ${id} not found!`,
      });
    }

    if (blog.account.id !== req.user.id) {
      return res.status(400).json({
        statusCode: 400,
        msg: "You can not delete a blog that is not yours!",
      });
    }

    const deletedBlog = await usersBlogsServices.deleteBlog(id);

    if (deletedBlog) {
      await notificationsServices.createNotification(
        req.user.id,
        `Blog: ${blog.name} was deleted successfully!`
      );

      return res.status(200).json({
        statusCode: 200,
        msg: "Blog deleted successfully!",
        data: deletedBlog,
      });
    }
  } catch (error) {
    console.log(error);
    return next("Error trying to delete a blog");
  }
};

module.exports = {
  createBlog,
  updateBlogName,
  deleteBlog,
};
