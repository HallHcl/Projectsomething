const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { updateBranch } = require("../controllers/userController");

router.patch("/branch", auth, updateBranch);

module.exports = router;
