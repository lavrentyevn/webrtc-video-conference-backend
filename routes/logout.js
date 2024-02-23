const express = require("express");
const router = express.Router();
const logoutController = require("../controllers/logoutController");

router.put("/", logoutController.handleLogout);

module.exports = router;
