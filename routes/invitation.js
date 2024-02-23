const express = require("express");
const router = express.Router();
const invitationController = require("../controllers/invitationController");

router.post("/", invitationController.handleInvitation);
router.post("/check", invitationController.checkInvitation);

module.exports = router;
