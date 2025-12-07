const User = require("../models/User");

// PATCH /api/user/branch
exports.updateBranch = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { branchCode, branchName } = req.body;
    if (!branchCode) return res.status(400).json({ message: "branchCode is required" });

    const user = await User.findByIdAndUpdate(
      userId,
      { branchCode, branchName },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Branch updated", user });
  } catch (err) {
    console.error("updateBranch error:", err);
    res.status(500).json({ message: err.message });
  }
};
