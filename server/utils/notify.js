const Notification = require("../models/Notification");

const createNotification = async ({
  recipient,
  sender = null,
  type = "system",
  title,
  message,
  link = "",
}) => {
  try {
    if (!recipient) return null;
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      link,
    });
    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error.message);
    return null;
  }
};

module.exports = { createNotification };
