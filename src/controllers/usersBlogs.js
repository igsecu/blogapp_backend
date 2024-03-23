const notificationsServices = require("../services/notifications");
const usersBlogsServices = require("../services/usersBlogs");
const usersAccountsServices = require("../services/usersAccounts");

const {
  validateId,
  validateName,
  validateText,
  validateTitle,
  validateLimit,
  validatePage,
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

// Get blogs
const getBlogs = async (req, res, next) => {
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

    const blogs = await usersBlogsServices.getBlogs(
      req.user.id,
      page ? page : 1,
      limit ? limit : 10
    );

    if (!blogs) {
      return res.status(404).json({
        statusCode: 404,
        msg: "No blogs saved in DB",
      });
    }

    if (!blogs.data.length) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Page ${page} not found!`,
      });
    }

    res.status(200).json({
      statusCode: 200,
      ...blogs,
    });
  } catch (error) {
    return next(error);
  }
};

// Get filtered blogs
const getFilteredBlogs = async (req, res, next) => {
  const { page, limit, name } = req.query;
  try {
    if (!name) {
      return res.status(400).json({
        statusCode: 400,
        msg: "Name query parameter is missing",
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

    const blogs = await usersBlogsServices.getFilteredBlogs(
      req.user.id,
      name,
      page ? page : 1,
      limit ? limit : 10
    );

    if (!blogs) {
      return res.status(404).json({
        statusCode: 404,
        msg: `No blogs with name: ${name} found!`,
      });
    }

    if (!blogs.data.length) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Page ${page} not found!`,
      });
    }

    res.status(200).json({
      statusCode: 200,
      ...blogs,
    });
  } catch (error) {
    return next(error);
  }
};

// Get Account blogs
const getAccountBlogs = async (req, res, next) => {
  const { page, limit } = req.query;
  const { id } = req.params;

  try {
    if (!validateId(id)) {
      return res.status(400).json({
        statusCode: 400,
        msg: `accountId: ${id} - Invalid format!`,
      });
    }

    const account = await usersAccountsServices.getAccountById(id);

    if (!account) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Account with ID: ${id} not found!`,
      });
    }

    if (account.isBanned === true) {
      return res.status(400).json({
        statusCode: 400,
        msg: "This account is banned! You can not access to it...",
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

    const blogs = await usersBlogsServices.getAccountBlogs(
      id,
      page ? page : 1,
      limit ? limit : 10
    );

    if (!blogs) {
      return res.status(404).json({
        statusCode: 404,
        msg: "This account does not have blogs!",
      });
    }

    if (!blogs.data.length) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Page ${page} not found!`,
      });
    }

    res.status(200).json({
      statusCode: 200,
      ...blogs,
    });
  } catch (error) {
    return next(error);
  }
};

// Get own blogs
const getOwnBlogs = async (req, res, next) => {
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

    const blogs = await usersBlogsServices.getOwnBlogs(
      req.user.id,
      page ? page : 1,
      limit ? limit : 10
    );

    if (!blogs) {
      return res.status(404).json({
        statusCode: 404,
        msg: "You do not have blogs!",
      });
    }

    if (!blogs.data.length) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Page ${page} not found!`,
      });
    }

    res.status(200).json({
      statusCode: 200,
      ...blogs,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createBlog,
  updateBlogName,
  deleteBlog,
  getBlogs,
  getFilteredBlogs,
  getAccountBlogs,
  getOwnBlogs,
};
