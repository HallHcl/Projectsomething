const Branch = require("../models/Branch");

// GET /api/branches
exports.listBranches = async (req, res) => {
  try {
    const branches = await Branch.find({}).sort({ code: 1 }).lean();
    res.json(branches);
  } catch (err) {
    console.error("listBranches error:", err);
    res.status(500).json({ message: err.message });
  }
};

// POST /api/branches (create new branch)
exports.createBranch = async (req, res) => {
  try {
    const { code, name } = req.body;
    if (!code || !name) {
      return res.status(400).json({ message: "code and name are required" });
    }

    // Check if branch already exists
    const existing = await Branch.findOne({ code });
    if (existing) {
      return res.status(400).json({ message: "Branch code already exists" });
    }

    const branch = await Branch.create({ code, name });
    res.status(201).json({ message: "Branch created", branch });
  } catch (err) {
    console.error("createBranch error:", err);
    res.status(500).json({ message: err.message });
  }
};

// POST /api/branches/bulk (create multiple branches)
exports.createMultipleBranches = async (req, res) => {
  try {
    const { branches } = req.body;
    if (!Array.isArray(branches) || branches.length === 0) {
      return res.status(400).json({ message: "branches array is required" });
    }

    // Validate each branch
    for (const branch of branches) {
      if (!branch.code || !branch.name) {
        return res.status(400).json({ message: "Each branch must have code and name" });
      }
    }

    // Check for duplicates in DB
    const codes = branches.map(b => b.code);
    const existing = await Branch.find({ code: { $in: codes } });
    if (existing.length > 0) {
      return res.status(400).json({ 
        message: `Branch codes already exist: ${existing.map(b => b.code).join(", ")}` 
      });
    }

    // Insert all branches
    const result = await Branch.insertMany(branches);
    res.status(201).json({ 
      message: `${result.length} branches created`, 
      branches: result 
    });
  } catch (err) {
    console.error("createMultipleBranches error:", err);
    res.status(500).json({ message: err.message });
  }
};
