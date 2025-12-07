// src/routes/ticketRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { 
  createTicket, 
  getUserTickets, 
  getRecentTickets,
  getOverview,
  getTicketById, 
  updateStatus 
} = require("../controllers/ticketController");

// Routes
router.post("/", auth, createTicket); // create ticket
router.get("/user/me", auth, getUserTickets); // list all user's tickets (with pagination)
router.get("/user/me/recent", auth, getRecentTickets); // list recent 5 tickets
router.get("/overview", auth, getOverview); // dashboard overview counts
router.get("/:id", auth, getTicketById); // get single ticket
router.put("/:id/status", auth, adminMiddleware, updateStatus); // update status (admin only)

module.exports = router;
