const db = require("../config/db");
const bcrypt = require("bcrypt");

const handleCreateRoom = async (req, res) => {
  const { name, password, description, creator } = req.body;
  const check = await db.query(`SELECT * FROM room WHERE name = '${name}'`);
  if (check.rowCount) {
    return res.status(409).send("this room name is taken");
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const timestampWithoutTimezone = new Date().toLocaleString();

    const findUserId = await db.query(
      `SELECT user_model.id FROM user_model 
        JOIN client ON client.user_model_id = user_model.id 
        WHERE client.username = '${creator}'`
    );

    if (!findUserId.rowCount) return res.status(404).send("No user found");

    const room = await db.query(
      `INSERT INTO room (name, password, creator_id, created_at, description)
        VALUES ('${name}', '${hashedPassword}', ${findUserId.rows[0].id}, '${timestampWithoutTimezone}', '${description}')`
    );

    res.status(200).send("create room success");
  } catch (e) {
    res.status(500).send("error");
  }
};

const handleAccessRoom = async (req, res) => {
  const { name, password } = req.body;

  const check = await db.query(`SELECT * FROM room WHERE name = '${name}'`);
  if (!check.rowCount) return res.status(404).send("no room found");

  try {
    const match = await bcrypt.compare(password, check.rows[0].password);

    if (match) {
      return res.status(200).send("success");
    } else {
      return res.status(401).send("wrong password");
    }
  } catch (err) {
    res.status(400).send("error");
  }
};

const checkRooms = async (req, res) => {
  const { username } = req.body;

  let user_id = 0;

  const check = await db.query(
    `SELECT u.id FROM user_model u 
    INNER JOIN client c ON u.id = c.user_model_id 
    WHERE c.username = '${username}'`
  );
  if (check.rowCount) user_id = check.rows[0].id;

  try {
    const checkRooms = await db.query(
      `SELECT r.name, e.room_id, c.username, r.created_at, r.description FROM room r
      LEFT JOIN event e ON r.id = e.room_id
      LEFT JOIN invitation i ON r.id = i.room_id 
      LEFT JOIN user_model um ON um.id = r.creator_id
      LEFT JOIN client c ON c.user_model_id = um.id
      WHERE e.room_id IS NULL OR r.creator_id = ${user_id} OR i.user_model_id = ${user_id}`
    );

    res.status(200).send(checkRooms.rows);
  } catch (err) {
    res.status(400).send("error");
  }
};

module.exports = { handleCreateRoom, handleAccessRoom, checkRooms };
