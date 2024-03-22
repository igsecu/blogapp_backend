const adminBlogsServices = require("../services/adminBlogs");
const usersBlogsServices = require("../services/usersBlogs");

const { validateId } = require("../utils/index");

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

module.exports = {
  banBlog,
  notBanBlog,
};
