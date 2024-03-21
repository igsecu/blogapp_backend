const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

require("dotenv").config();

// Send email verification
const sendEmailVerification = async (url, email) => {
  const msg = {
    to: email,
    from: process.env.SENDGRID_SENDER,
    subject: "Verify your account",
    html: `<html><a href=${url}>${url}</a></html>`,
  };

  await sgMail.send(msg);
};

module.exports = {
  sendEmailVerification,
};
