const db = require("../config/db");

const createEvent = async (req, res) => {
  const { room } = req.body;

  try {
    const checkRoom = await db.query(
      `SELECT id FROM room WHERE name = '${room}'`
    );
    if (!checkRoom.rowCount) return res.status(401).send("Room not found");
    const roomId = checkRoom.rows[0].id;

    const event = await db.query(
      `INSERT INTO event (room_id) VALUES (${roomId})`
    );

    res.sendStatus(200);
  } catch (err) {
    res.status(500).send("error");
  }
};

const logEvent = async (req, res) => {
  const { email, name, move } = req.body;

  try {
    const user = await db.query(
      `SELECT id FROM user_model WHERE email = '${email}'`
    );
    if (!user.rowCount) return res.status(404).send("No user found");

    const event = await db.query(
      `SELECT e.id FROM event e 
      INNER JOIN room r ON r.id = e.room_id 
      WHERE r.name = '${name}'`
    );
    if (!event.rowCount) return res.status(404).send("No event found");

    const timestampWithoutTimezone = new Date().toLocaleString();

    if (move === "j") {
      const logJoin = await db.query(
        `INSERT INTO event_log (event_id, user_model_id, joined_at)
        VALUES (${event.rows[0].id}, ${user.rows[0].id}, '${timestampWithoutTimezone}')`
      );
    } else if (move === "l") {
      const logLeave = await db.query(
        `UPDATE event_log 
        SET left_at = '${timestampWithoutTimezone}'
        WHERE id IN (
        SELECT el.id FROM event_log el 
        INNER JOIN event e ON el.event_id = e.id 
        INNER JOIN room r ON e.room_id = r.id 
        WHERE el.event_id = ${event.rows[0].id}  AND el.user_model_id = ${user.rows[0].id}
        ORDER BY el.id DESC LIMIT 1)`
      );
    } else {
      return res.sendStatus(400);
    }

    res.sendStatus(200);
  } catch (err) {
    res.status(500).send("error");
  }
};

module.exports = { createEvent, logEvent };
