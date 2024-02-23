const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");

router.post("/", clientController.createClient);
router.post("/login", clientController.loginClient);
router.put("/verify", clientController.verifyClient);

module.exports = router;
