const Ticket = require("../models/Ticket");

// Generate unique ticket number: IT-SUP001, IT-SUP002, etc.
const generateTicketNumber = async () => {
  const count = await Ticket.countDocuments();
  const num = String(count + 1).padStart(3, "0"); // 001, 002, 003...
  return `IT-SUP${num}`;
};

// POST /api/tickets (create new ticket)
exports.createTicket = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const {
      ticketKey,
      branchCode,
      branchName,
      anydeskNumber,
      issueType,
      subIssue,
      details,
      attachedFile,
    } = req.body;

    if (!branchCode || !issueType || !details) {
      return res.status(400).json({ message: "Missing required fields (branchCode, issueType, details)" });
    }

    const ticketNumber = await generateTicketNumber();

    const ticket = await Ticket.create({
      ticketNumber,
      ticketKey: ticketKey || ticketNumber, // use ticketNumber as fallback
      branchCode,
      branchName,
      anydeskNumber,
      issueType,
      subIssue,
      details,
      attachedFile,
      createdBy: userId,
      status: "WAIT FOR SUPPORT",
    });

    res.status(201).json({ message: "Ticket created", ticket });
  } catch (err) {
    console.error("createTicket error:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/tickets/user/me (list user's own tickets)
exports.getUserTickets = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { limit = 10, skip = 0, status } = req.query;

    // Build filter
    const filter = { createdBy: userId };
    if (status) {
      filter.status = status;
    }

    const tickets = await Ticket.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate("createdBy", "email employeeId branchCode");

    const total = await Ticket.countDocuments(filter);

    res.json({ tickets, total, limit: parseInt(limit), skip: parseInt(skip) });
  } catch (err) {
    console.error("getUserTickets error:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/tickets/user/me/recent (list recent 5 tickets)
exports.getRecentTickets = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const tickets = await Ticket.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("createdBy", "email employeeId");

    res.json(tickets);
  } catch (err) {
    console.error("getRecentTickets error:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/tickets/overview (summary counts for current user)
exports.getOverview = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // total tickets
    const total = await Ticket.countDocuments({ createdBy: userId });

    // counts by status
    const statuses = ["WAIT FOR SUPPORT", "WORK IN PROGRESS", "CHECKING", "PENDING", "DONE", "CANCEL"];
    const counts = {};
    await Promise.all(statuses.map(async (s) => {
      counts[s] = await Ticket.countDocuments({ createdBy: userId, status: s });
    }));

    // new notifications: tickets WAIT FOR SUPPORT created in last 24 hours
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const newNotifications = await Ticket.countDocuments({ createdBy: userId, status: "WAIT FOR SUPPORT", createdAt: { $gte: since } });

    res.json({ total, counts, newNotifications });
  } catch (err) {
    console.error("getOverview error:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/tickets/:id (get ticket by ID)
exports.getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findById(id).populate(
      "createdBy",
      "email employeeId branchCode"
    );

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    res.json(ticket);
  } catch (err) {
    console.error("getTicketById error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { newStatus } = req.body;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const currentStatus = ticket.status;

    // กติกา workflow
    const workflow = {
      "WAIT FOR SUPPORT": ["WORK IN PROGRESS"],
      "WORK IN PROGRESS": ["CHECKING"],
      "CHECKING": ["PENDING", "DONE", "CANCEL"],
      "PENDING": [],
      "DONE": [],
      "CANCEL": []
    };

    // ตรวจสอบว่าเปลี่ยนไปสถานะที่อนุญาตไหม
    if (!workflow[currentStatus].includes(newStatus)) {
      return res.status(400).json({
        message: `Cannot change status from ${currentStatus} → ${newStatus}`
      });
    }

    ticket.status = newStatus;
    await ticket.save();

    return res.json({
      message: "Status updated successfully",
      ticket
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
