const adminBlogsServices = require("../services/adminBlogs");
const usersBlogsServices = require("../services/usersBlogs");

const { validateId, validatePage, validateLimit } = require("../utils/index");

// Ban blog
const banBlog = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!validateId(id)) {
      return res.status(400).json({
        statusCode: 400,
        msg: `ID: ${id} - Invalid format!`,
      });
    }

    const blogFound = await usersBlogsServices.getBlogById(id);

    if (!blogFound) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Blog with ID: ${id} not found!`,
      });
    }

    const updatedBlog = await adminBlogsServices.banBlog(id);

    if (updatedBlog) {
      return res.status(200).json({
        statusCode: 200,
        msg: "Blog updated successfully!",
      });
    }
  } catch (error) {
    return next("Error trying to ban a blog");
  }
};

// Not Ban blog
const notBanBlog = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!validateId(id)) {
      return res.status(400).json({
        statusCode: 400,
        msg: `ID: ${id} - Invalid format!`,
      });
    }

    const blogFound = await usersBlogsServices.getBlogById(id);

    if (!blogFound) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Blog with ID: ${id} not found!`,
      });
    }

    const updatedBlog = await adminBlogsServices.notBanBlog(id);

    if (updatedBlog) {
      return res.status(200).json({
        statusCode: 200,
        msg: "Blog updated successfully!",
      });
    }
  } catch (error) {
    return next("Error trying to not ban a blog");
  }
};

// Get Blogs
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

    const blogs = await adminBlogsServices.getBlogs(
      page ? page : 1,
      limit ? limit : 10
    );

    if (!blogs) {
      return res.status(404).json({
        statusCode: 404,
        msg: "No blogs saved in DB!",
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
    console.log(error);
    return next(error);
  }
};

// Get Filtered Blogs
const getFilteredBlogs = async (req, res, next) => {
  const { page, limit, name } = req.query;
  try {
    if (!name) {
      return res.status(400).json({
        statusCode: 400,
        msg: "Name query is missing",
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

    const blogs = await adminBlogsServices.getFilteredBlogs(
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
    console.log(error);
    return next(error);
  }
};

module.exports = {
  banBlog,
  notBanBlog,
  getBlogs,
  getFilteredBlogs,
};
