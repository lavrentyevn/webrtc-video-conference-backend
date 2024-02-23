const db = require("../config/db");
const { emailGuest } = require("../email/emailSender");
const jwt = require("jsonwebtoken");

const createGuest = async (req, res) => {
  const { email } = req.body;

  try {
    // const check = await db.query(
    //   `SELECT user_model.email FROM guest
    //         JOIN user_model ON user_model.id = guest.user_model_id
    //         WHERE email = '${email}'`
    // );

    // if (check.rows[0]) return res.status(404).send("Already used email");

    // do not let create another guest account if found
    // commented code only on production

    emailGuest(email);

    const timestampWithoutTimezone = new Date().toLocaleString();
    const user = await db.query(
      `INSERT INTO user_model (email, refresh_token, created_at, verified)
        VALUES ('${email}', '', '${timestampWithoutTimezone}', FALSE)`
    );

    const foreignKey = await db.query(
      `SELECT id FROM user_model WHERE email = '${email}'`
    );

    const guest = await db.query(`INSERT INTO guest (user_model_id)
        VALUES (${foreignKey.rows[0].id})`);

    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(400);
  }
};

const loginGuest = async (req, res) => {
  try {
    const decodedToken = jwt.verify(
      req.query.token,
      process.env.ACCESS_TOKEN_SECRET
    );

    const email = decodedToken.email;
    if (!email)
      return res.status(400).json({ message: "No email found in token" });

    const user = await db.query(
      `SELECT email, verified FROM user_model WHERE email = '${email}'`
    );

    if (!user.rows[0]) return res.status(404).send("Not found email");
    if (user.rows[0].verified) return res.status(204).send("Already verified");

    const accessToken = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "30s",
    });
    const refreshToken = jwt.sign({ email }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "1h",
    });

    const userRefreshToken = await db.query(
      `UPDATE user_model SET refresh_token = '${refreshToken}', verified = TRUE WHERE email = '${email}'`
    );

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    console.log(accessToken);
    res.json({ accessToken });
  } catch (err) {
    res.sendStatus(400);
  }
};

module.exports = { createGuest, loginGuest };
