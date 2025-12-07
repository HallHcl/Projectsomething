const User = require("../models/User");
const bcrypt = require("bcryptjs");

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

// PATCH /api/user/profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { phone, theme, language } = req.body;
    const updateData = {};

    if (phone !== undefined) updateData.phone = phone;
    if (theme !== undefined) updateData.theme = theme;
    if (language !== undefined) updateData.language = language;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated", user });
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(500).json({ message: err.message });
  }
};

// POST /api/user/change-password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "currentPassword and newPassword are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("changePassword error:", err);
    res.status(500).json({ message: err.message });
  }
};
