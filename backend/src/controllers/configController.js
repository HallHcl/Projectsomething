const { STATUS_OPTIONS } = require("../config/statusConfig");

// GET /api/config/statuses
exports.getStatuses = (req, res) => {
  try {
    res.json(STATUS_OPTIONS);
  } catch (err) {
    console.error("getStatuses error:", err);
    res.status(500).json({ message: err.message });
  }
};
