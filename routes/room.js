const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");

router.post("/", roomController.handleCreateRoom);
router.post("/access", roomController.handleAccessRoom);
router.post("/check", roomController.checkRooms);

module.exports = router;
