const notificationsServices = require("../services/notifications");

const { validateLimit, validatePage, validateId } = require("../utils/index");

// Get all notifications
const getNotifications = async (req, res, next) => {
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
    const notifications = await notificationsServices.getAllNotifications(
      req.user.id,
      page ? page : 1,
      limit ? limit : 10
    );

    if (!notifications) {
      return res.status(404).json({
        statusCode: 404,
        msg: "You do not have notifications!",
      });
    }

    if (!notifications.data.length) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Page ${page} not found!`,
      });
    }

    res.status(200).json({
      statusCode: 200,
      ...notifications,
    });
  } catch (error) {
    return next(error);
  }
};

// Get not read notifications
const getNotReadNotifications = async (req, res, next) => {
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
    const notifications = await notificationsServices.getNotReadNotifications(
      req.user.id,
      page ? page : 1,
      limit ? limit : 10
    );

    if (!notifications) {
      return res.status(404).json({
        statusCode: 404,
        msg: "You do not have notifications!",
      });
    }

    if (!notifications.data.length) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Page ${page} not found!`,
      });
    }

    res.status(200).json({
      statusCode: 200,
      ...notifications,
    });
  } catch (error) {
    return next(error);
  }
};

// Update read notifications
const updateReadNotifications = async (req, res, next) => {
  try {
    const notReadNotifications =
      await notificationsServices.getNotReadNotifications(req.user.id, 1, 10);

    if (!notReadNotifications) {
      return res.status(404).json({
        statusCode: 404,
        msg: "You do not have not read notifications!",
      });
    }

    const notifications = await notificationsServices.updateReadNotifications(
      req.user.id
    );

    if (notifications) {
      res.status(200).json({
        statusCode: 200,
        msg: "All your notifications are read!",
      });
    }
  } catch (error) {
    return next(error);
  }
};

// Delete notification
const deleteNotification = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!validateId(id)) {
      return res.status(400).json({
        statusCode: 400,
        msg: `ID: ${id} - Invalid format!`,
      });
    }

    const notification = await notificationsServices.getNotificationById(id);

    if (!notification) {
      return res.status(404).json({
        statusCode: 404,
        msg: `Notification with ID: ${id} not found!`,
      });
    }

    if (notification.account.id !== req.user.id) {
      return res.status(400).json({
        statusCode: 400,
        msg: "You can not delete a notification that is not yours!",
      });
    }

    const deletedNotification = await notificationsServices.deleteNotification(
      id
    );

    if (deletedNotification) {
      res.status(200).json({
        statusCode: 200,
        msg: "Notification deleted successfully!",
      });
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getNotifications,
  getNotReadNotifications,
  updateReadNotifications,
  deleteNotification,
};
