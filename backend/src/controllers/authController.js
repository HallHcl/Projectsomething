const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ---------------- REGISTER ----------------
exports.register = async (req, res) => {
  try {
    const { email, password, employeeId, branchCode, branchName } = req.body;

    // เช็คอีเมลซ้ำ
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      employeeId,
      branchCode,
      branchName,
      role: "user"
    });

    res.status(201).json({
      message: "Register success",
      user: {
        id: user._id,
        email: user.email,
        employeeId: user.employeeId,
        branchCode: user.branchCode,
        branchName: user.branchName,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ---------------- LOGIN ----------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // หา user จาก email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email" });

    // เช็ค password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid password" });

    // สร้าง JWT พร้อมข้อมูลสำคัญที่ต้องใช้สร้าง Ticket
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        branchCode: user.branchCode,
        branchName: user.branchName
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // 7 วัน (เหมาะกับระบบงาน)
    );

    res.json({
      message: "Login success",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        branchCode: user.branchCode,
        branchName: user.branchName
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
