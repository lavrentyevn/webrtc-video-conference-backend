const db = require("../config/db");

const handleInvitation = async (req, res) => {
  const { email, room } = req.body;

  try {
    const checkRoom = await db.query(
      `SELECT id FROM room WHERE name = '${room}'`
    );
    if (!checkRoom.rowCount) return res.status(401).send("Room not found");
    const roomId = checkRoom.rows[0].id;

    var quotedAndCommaSeparated = "'" + email.join("','") + "'";

    const checkEmail = await db.query(
      `SELECT id FROM user_model WHERE email IN (${quotedAndCommaSeparated})`
    );
    if (!checkEmail.rowCount) return res.status(404).send("Guests not found");
    const userIds = [];

    for (let index = 0; index < checkEmail.rowCount; index++) {
      userIds.push(checkEmail.rows[index].id);
    }

    for (let index = 0; index < userIds.length; index++) {
      const invite = await db.query(
        `INSERT INTO invitation (user_model_id, room_id) VALUES (${userIds.at(
          index
        )}, ${roomId})`
      );
    }
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send("error");
  }
};

const checkInvitation = async (req, res) => {
  const { email, room } = req.body;
  try {
    const check = await db.query(
      `SELECT invitation.id FROM invitation 
            JOIN room ON invitation.room_id = room.id 
            JOIN user_model ON invitation.user_model_id = user_model.id 
            WHERE user_model.email = '${email}' AND room.name = '${room}'`
    );
    const checkIfCreator = await db.query(
      `SELECT um.id FROM user_model um 
      INNER JOIN room r ON r.creator_id = um.id 
      INNER JOIN client c ON um.id = c.user_model_id 
      WHERE email = '${email}' AND r.name = '${room}'`
    );
    if (!check.rowCount && !checkIfCreator.rowCount)
      return res.status(403).send("This person is not invited");
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send("error");
  }
};

module.exports = { handleInvitation, checkInvitation };
