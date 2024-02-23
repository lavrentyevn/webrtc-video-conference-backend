const express = require("express");
const router = express.Router();
const guestController = require("../controllers/guestController");

router.post("/", guestController.createGuest);
router.put("/verify", guestController.loginGuest);

module.exports = router;
