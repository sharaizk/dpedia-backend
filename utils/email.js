const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");

const readHTMLFile = (path, callback) => {
  fs.readFile(path, { encoding: "utf-8" }, function(err, html) {
    if (err) {
      throw err;
    } else {
      callback(null, html);
    }
  });
};

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `${process.env.EMAIL_NAME} <${process.env.EMAIL}>`,
    to: options.email,
    subject: options.subject,
  };

  if (options.template) {
    readHTMLFile(options.template, async (err, html) => {
      const template = handlebars.compile(html);
      const htmlToSend = template(options.replacements);
      mailOptions.html = htmlToSend;
      await transporter.sendMail(mailOptions);
    });
    return;
  } else {
    mailOptions.text = options.message;
  }

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
