const Notification = require("../models/Notification");
const BlogAccount = require("../models/BlogAccount");

// Get notification by id
const getNotificationById = async (id) => {
  try {
    const result = await Notification.findByPk(id, {
      attributes: ["id", "text", "read"],
      include: {
        model: BlogAccount,
        attributes: ["id"],
      },
    });

    if (result) {
      return {
        id: result.id,
        text: result.text,
        read: result.read,
        account: {
          id: result.blogAccount.id,
        },
      };
    }

    return result;
  } catch (error) {
    throw new Error("Error trying to get a notifications by its id");
  }
};

// Create Notification
const createNotification = async (id, text) => {
  try {
    await Notification.create({
      blogAccountId: id,
      text,
    });
  } catch (error) {
    throw new Error("Error trying to create notification");
  }
};

// Get all notifications
const getAllNotifications = async (id, page, limit) => {
  const results = [];
  try {
    const dbResults = await Notification.findAndCountAll({
      attributes: ["id", "text", "read"],
      include: {
        model: BlogAccount,
        where: {
          id,
        },
      },
      order: [["createdAt", "DESC"]],
      limit,
      offset: page * limit - limit,
    });

    if (dbResults.count === 0) {
      return false;
    }

    if (dbResults.rows.length > 0) {
      dbResults.rows.forEach((r) => {
        results.push({
          id: r.id,
          text: r.text,
          read: r.read,
        });
      });

      return {
        totalResults: dbResults.count,
        totalPages: Math.ceil(dbResults.count / limit),
        page: parseInt(page),
        data: results,
      };
    } else {
      return { data: [] };
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to get all notifications");
  }
};

// Get not read notifications
const getNotReadNotifications = async (id, page, limit) => {
  const results = [];
  try {
    const dbResults = await Notification.findAndCountAll({
      attributes: ["id", "text", "read"],
      include: {
        model: BlogAccount,
        where: {
          id,
        },
      },
      where: {
        read: false,
      },
      order: [["createdAt", "DESC"]],
      limit,
      offset: page * limit - limit,
    });

    if (dbResults.count === 0) {
      return false;
    }

    if (dbResults.rows.length > 0) {
      dbResults.rows.forEach((r) => {
        results.push({
          id: r.id,
          text: r.text,
          read: r.read,
        });
      });

      return {
        totalResults: dbResults.count,
        totalPages: Math.ceil(dbResults.count / limit),
        page: parseInt(page),
        data: results,
      };
    } else {
      return { data: [] };
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to get not read notifications");
  }
};

// Update Read notifications
const updateReadNotifications = async (id) => {
  try {
    const updatedNotifications = await Notification.update(
      {
        read: true,
      },
      {
        where: {
          blogAccountId: id,
        },
      }
    );

    if (updatedNotifications) {
      return updatedNotifications;
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to update notifications");
  }
};

// Delete notification
const deleteNotification = async (id) => {
  try {
    const deletedNotification = await Notification.destroy({
      where: {
        id,
      },
    });

    if (deletedNotification) {
      return deletedNotification;
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Error trying to delete a notification");
  }
};

module.exports = {
  createNotification,
  getAllNotifications,
  getNotReadNotifications,
  updateReadNotifications,
  getNotificationById,
  deleteNotification,
};
