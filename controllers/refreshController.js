const db = require("../config/db");
const jwt = require("jsonwebtoken");

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);
  const refreshToken = cookies.jwt;

  const foundUser = await db.query(
    `SELECT * FROM user_model WHERE refresh_token = '${refreshToken}'`
  );
  if (!foundUser.rowCount) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || foundUser.rows[0].email !== decoded.email)
      return res.sendStatus(403);

    if (decoded.username) {
      const username = decoded.username;
      const email = decoded.email;

      const accessToken = jwt.sign(
        { username, email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "10s" }
      );

      res.json({ accessToken, username, email });
    } else {
      const email = decoded.email;

      const accessToken = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "10s",
      });
      res.json({ accessToken, email });
    }
  });
};

module.exports = { handleRefreshToken };
