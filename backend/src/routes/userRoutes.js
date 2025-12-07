const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { updateBranch, updateProfile, changePassword } = require("../controllers/userController");

router.patch("/branch", auth, updateBranch);
router.patch("/profile", auth, updateProfile);
router.post("/change-password", auth, changePassword);

module.exports = router;
