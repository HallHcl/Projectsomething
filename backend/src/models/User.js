const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    fullName: {
      type: String,
      default: ""
    },
    employeeId: {
      type: String,
      required: true
    },
    position: {
      type: String,
      default: ""
    },
    department: {
      type: String,
      default: ""
    },
    branchCode: {
      type: String,
      required: true
    },
    branchName: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      default: ""
    },
    profileImage: {
      type: String,
      default: null
    },
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light"
    },
    language: {
      type: String,
      enum: ["th", "en"],
      default: "th"
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
