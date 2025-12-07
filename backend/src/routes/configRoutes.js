const express = require("express");
const { getStatuses } = require("../controllers/configController");

const router = express.Router();

// GET /api/config/statuses
router.get("/statuses", getStatuses);

module.exports = router;
