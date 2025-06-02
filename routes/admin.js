const admin = require("../models/admin")
const express = require('express');
const router = express.Router();
const controller = require("../controllers/admin")

router.post("/admin/checkToken", controller.checkToken)

module.exports = router;