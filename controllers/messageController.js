const db = require("../config/db");

const logMessage = async (req, res) => {
  const { roomname, email, message } = req.body;

  const room = await db.query(`SELECT id FROM room WHERE name = '${roomname}'`);
  if (!room.rowCount) return res.status(404).send("No room found");

  const user = await db.query(
    `SELECT id FROM user_model WHERE email = '${email}'`
  );
  if (!user.rowCount) return res.status(404).send("No user found");

  const timestampWithoutTimezone = new Date().toLocaleString();

  const log = await db.query(
    `INSERT INTO message (room_id, user_model_id, message_text, sent_at)
        VALUES (${room.rows[0].id}, ${user.rows[0].id}, '${message}', '${timestampWithoutTimezone}')`
  );

  res.sendStatus(200);
};

module.exports = { logMessage };
