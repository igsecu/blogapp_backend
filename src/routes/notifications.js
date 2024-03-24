const express = require("express");
const router = express.Router();

const usersNotificationsController = require("../controllers/usersNotifications");

const { ensureAuthenticatedUser } = require("../utils/index");

// Get logged in user not read notifications
router.get(
  "/notifications/read/false",
  ensureAuthenticatedUser,
  usersNotificationsController.getNotReadNotifications
);
// Get logged in user notifications
router.get(
  "/notifications",
  ensureAuthenticatedUser,
  usersNotificationsController.getNotifications
);
// Update read notifications
router.put(
  "/notifications/read/true",
  ensureAuthenticatedUser,
  usersNotificationsController.updateReadNotifications
);
// Delete notification
router.delete(
  "/notification/:id",
  ensureAuthenticatedUser,
  usersNotificationsController.deleteNotification
);

module.exports = router;
