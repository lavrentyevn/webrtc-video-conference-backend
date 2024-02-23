const db = require("../config/db");

const handleLogout = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204);
  const refreshToken = cookies.jwt;

  const foundUser = await db.query(
    `SELECT * FROM user_model WHERE refresh_token = '${refreshToken}'`
  );
  if (!foundUser.rowCount) {
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    return res.sendStatus(204);
  }

  const updateRefreshToken = await db.query(
    `UPDATE user_model SET refresh_token = '' WHERE refresh_token = '${refreshToken}'`
  );

  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });
  res.sendStatus(204);
};

module.exports = { handleLogout };
