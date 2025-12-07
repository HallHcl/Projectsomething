const express = require("express");
const router = express.Router();
const { listBranches, createBranch, createMultipleBranches } = require("../controllers/branchController");

router.get("/", listBranches);
router.post("/", createBranch);
router.post("/bulk", createMultipleBranches);

module.exports = router;
