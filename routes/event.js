const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");

router.post("/", eventController.createEvent);
router.post("/log", eventController.logEvent);

module.exports = router;
