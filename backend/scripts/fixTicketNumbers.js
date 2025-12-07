/**
 * Fix missing ticketNumber in old tickets
 * Run this once to backfill ticketNumber for existing tickets
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Ticket = require("./src/models/Ticket");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for migration");
  } catch (err) {
    console.error("MongoDB Error:", err);
    process.exit(1);
  }
};

const fixTicketNumbers = async () => {
  try {
    // Find all tickets without ticketNumber
    const ticketsWithoutNumber = await Ticket.find({ ticketNumber: { $exists: false } })
      .sort({ createdAt: 1 });

    if (ticketsWithoutNumber.length === 0) {
      console.log("✅ No tickets missing ticketNumber");
      return;
    }

    console.log(`Found ${ticketsWithoutNumber.length} tickets missing ticketNumber`);

    // Get the starting index
    const existingCount = await Ticket.countDocuments({ ticketNumber: { $exists: true } });
    let startNum = existingCount + 1;

    // Update each ticket
    for (const ticket of ticketsWithoutNumber) {
      const num = String(startNum).padStart(3, "0");
      const ticketNumber = `IT-SUP${num}`;

      await Ticket.findByIdAndUpdate(ticket._id, {
        ticketNumber,
        ticketKey: ticket.ticketKey || ticketNumber,
      });

      console.log(`✅ Updated: ${ticket._id} → ${ticketNumber}`);
      startNum++;
    }

    console.log("✅ Migration completed!");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB Disconnected");
    process.exit(0);
  }
};

// Run
connectDB().then(() => fixTicketNumbers());
