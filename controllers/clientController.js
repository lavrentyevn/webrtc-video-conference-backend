const db = require("../config/db");
const bcrypt = require("bcrypt");
const { emailClient } = require("../email/emailSender");
const jwt = require("jsonwebtoken");

const createClient = async (req, res) => {
  const { email, username, password } = req.body;

  try {
    // if a guest decided to create a client account

    const guestConvertToClient = await db.query(
      `SELECT * FROM guest JOIN user_model ON user_model.id = guest.user_model_id WHERE email = '${email}'`
    );

    if (guestConvertToClient.rowCount) {
      const deleteGuest = await db.query(
        `DELETE FROM guest USING user_model 
            WHERE guest.user_model_id = user_model.id 
            AND user_model.email = '${email}'`
      );
      const deleteUser = await db.query(
        `DELETE FROM user_model WHERE email = '${email}'`
      );
      console.log("guest deleted, can become a client");
    }

    const checkUsername = await db.query(
      `SELECT client.username FROM client
            JOIN user_model ON user_model.id = client.user_model_id
            WHERE username = '${username}'`
    );
    const checkEmail = await db.query(
      `SELECT user_model.email FROM client
            JOIN user_model ON user_model.id = client.user_model_id
            WHERE email = '${email}'`
    );
    if (checkUsername.rows[0] != null || username == "Guest") {
      // || email != null
      return res.status(409).send("this username already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const timestampWithoutTimezone = new Date().toLocaleString();

    console.log(timestampWithoutTimezone);

    const user = await db.query(
      `INSERT INTO user_model (email, refresh_token, created_at, verified)
        VALUES ('${email}', '', '${timestampWithoutTimezone}', FALSE)`
    );

    const foreignKey = await db.query(
      `SELECT id FROM user_model WHERE email = '${email}'`
    );

    const client = await db.query(
      `INSERT INTO client (user_model_id, username, password)
        VALUES (${foreignKey.rows[0].id}, '${username}', '${hashedPassword}')`
    );

    emailClient(email, username);

    res.status(200).send("register success");
  } catch (e) {
    res.status(500).send("error");
  }
};

const loginClient = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res
      .status(400)
      .json({ message: "Username and password are required." });

  // maybe it is an email, not a username
  const email = username;

  const check = await db.query(
    `SELECT client.username, user_model.verified, client.password, user_model.email FROM client 
            JOIN user_model ON user_model.id = client.user_model_id
            WHERE username = '${username}' OR email = '${email}'`
  );
  console.log(check);
  if (!check.rowCount) return res.status(401).send("No username found");

  if (!check.rows[0].verified)
    return res.status(403).send("Check your email to finish registration");

  const match = await bcrypt.compare(password, check.rows[0].password);
  if (match) {
    const accessToken = jwt.sign(
      { username: check.rows[0].username, email: check.rows[0].email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30s" }
    );
    const refreshToken = jwt.sign(
      { username: check.rows[0].username, email: check.rows[0].email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    const updateRefresh = await db.query(
      `UPDATE user_model SET refresh_token = '${refreshToken}'
        FROM client 
        WHERE user_model.id = client.user_model_id AND client.username = '${check.rows[0].username}'`
    );
    const timestampWithoutTimezone = new Date().toLocaleString();

    const updateLastLogin = await db.query(
      `UPDATE client SET last_login = '${timestampWithoutTimezone}'
            WHERE client.username = '${check.rows[0].username}'`
    );
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      username: check.rows[0].username,
      email: check.rows[0].email,
    });
  } else {
    res.sendStatus(401);
  }
};

const verifyClient = async (req, res) => {
  const token = req.query.token;
  if (token == null) return res.status(401).send("No token");

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const check = await db.query(
      `SELECT client.username, user_model.email, user_model.verified FROM client
                JOIN user_model ON user_model.id = client.user_model_id
                WHERE username = '${decodedToken.username}'`
    );
    if (!check.rowCount) return res.status(401).send("No user found");
    if (check.rows[0].verified) return res.status(401).send("Already verified");
    const verify = await db.query(
      `UPDATE user_model SET verified = TRUE WHERE email = '${check.rows[0].email}'`
    );
    res.status(200).send("Verified!");
  } catch (err) {
    res.sendStatus(401);
  }
};

module.exports = { createClient, loginClient, verifyClient };
