// src/models/IssueOption.js
const mongoose = require("mongoose");

const IssueOptionSchema = new mongoose.Schema({
  category: { type: String, required: true },
  subOptions: { type: [String], required: true },
});

module.exports = mongoose.model("IssueOption", IssueOptionSchema);
