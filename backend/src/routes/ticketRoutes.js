// src/routes/ticketRoutes.js
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { createTicket, getMyTickets, getAllTickets, updateStatus, getTicketById } = require("../controllers/ticketController");
const upload = require("../utils/uploads"); // ใช้จาก utils

// Upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "src/uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// Routes
router.post("/", authMiddleware, upload.single("attachedFile"), createTicket);
router.get("/me", authMiddleware, getMyTickets);
router.get("/all", authMiddleware, adminMiddleware, getAllTickets);
router.get("/:ticketId", authMiddleware, getTicketById);
router.put("/status/:ticketId", authMiddleware, adminMiddleware, updateStatus);

module.exports = router;
