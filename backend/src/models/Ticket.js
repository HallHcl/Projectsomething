const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    ticketKey: { 
      type: String, 
      required: true,
      unique: true 
    },
    branchName: { 
      type: String, 
      required: true 
    },
    branchCode: {
  type: String,
  required: true
    },
    issueType: { 
      type: String, 
      required: true 
    },
    details: { 
      type: String, 
      required: true 
    },
    attachedFile: {
      type: String, // path -> /uploads/file.png
      default: null
    },
    status: {
      type: String,
      enum: [
        "WAIT FOR SUPPORT",
        "WORK IN PROGRESS",
        "CHECKING",
        "PENDING",
        "DONE",
        "CANCEL"
      ],
      default: "WAIT FOR SUPPORT"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);
