const notificationsServices = require("../services/notifications");
const usersBlogsServices = require("../services/usersBlogs");

const {
  validateId,
  validateName,
  validateText,
  validateTitle,
} = require("../utils/index");

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

module.exports = {
  createBlog,
};
