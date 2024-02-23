require("dotenv").config();
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const db = require("../config/db");

const transporter = nodemailer.createTransport({
  host: "smtp.mail.ru",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_LOGIN,
    pass: process.env.MAIL_PASSWORD,
  },
});

const emailClient = (recipientEmail, recipientUsername) => {
  const accessToken = jwt.sign(
    { email: recipientEmail, username: recipientUsername },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  );
  const mailOptions = {
    from: process.env.MAIL_LOGIN,
    to: recipientEmail,
    subject: "Finish Registration",
    html: `<h1>Thanks for creating an account!</h1>
    <p>Here you can verify it and login into your new account.</>
    <a href="http://localhost:3000/verifyclient/${accessToken}">Log In</a>`,
  };
  transporter.sendMail(mailOptions, async (err, info) => {
    if (err) {
      console.log(err);
    } else {
      const findId = await db.query(
        `SELECT id FROM user_model WHERE email = '${recipientEmail}'`
      );
      if (!findId.rowCount) return -1;

      const timestampWithoutTimezone = new Date().toLocaleString();

      const log = await db.query(
        `INSERT INTO email_verification (user_model_id, sent_at)
        VALUES (${findId.rows[0].id}, '${timestampWithoutTimezone}')`
      );

      console.log("Email sent");
    }
  });
};

const emailGuest = (recipientEmail) => {
  const accessToken = jwt.sign(
    { email: recipientEmail },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  );
  const mailOptions = {
    from: process.env.MAIL_LOGIN,
    to: recipientEmail,
    subject: "Finish Registration",
    html: `<h1>Thanks for creating a guest account!</h1>
    <p>Here you can verify it and use it for some time.
    <a href="http://localhost:3000/verifyguest/${accessToken}">Log In</a>`,
  };
  transporter.sendMail(mailOptions, async (err, info) => {
    if (err) {
      console.log(err);
    } else {
      const findId = await db.query(
        `SELECT id FROM user_model WHERE email = '${recipientEmail}'`
      );
      if (!findId.rowCount) return -1;

      const timestampWithoutTimezone = new Date().toLocaleString();

      const log = await db.query(
        `INSERT INTO email_verification (user_model_id, sent_at)
        VALUES (${findId.rows[0].id}, '${timestampWithoutTimezone}')`
      );
      console.log("Email sent");
    }
  });
};

module.exports = { emailClient, emailGuest };
