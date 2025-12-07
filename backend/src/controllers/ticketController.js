exports.updateStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { newStatus } = req.body;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const currentStatus = ticket.status;
    const lastTicket = await Ticket.findOne().sort({ createdAt: -1 });
const nextKey = lastTicket
  ? `ITSUP-${String(parseInt(lastTicket.ticketKey.split("-")[1]) + 1).padStart(3, "0")}`
  : "ITSUP-001";


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
