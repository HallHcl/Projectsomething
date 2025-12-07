// Backend status configuration
// Single source of truth for all status mappings

const STATUS_CONFIG = {
  "WAIT FOR SUPPORT": {
    key: "WAIT FOR SUPPORT",
    th: "รอการปฏิบัติ",
    color: "bg-yellow-100 text-yellow-800",
    order: 1,
    description: "รอให้ support team เริ่มดำเนินการ"
  },
  "WORK IN PROGRESS": {
    key: "WORK IN PROGRESS",
    th: "กำลังดำเนินการ",
    color: "bg-blue-100 text-blue-800",
    order: 2,
    description: "กำลังมีคนดำเนินการกับ ticket นี้"
  },
  "CHECKING": {
    key: "CHECKING",
    th: "ตรวจสอบ",
    color: "bg-purple-100 text-purple-800",
    order: 3,
    description: "ตรวจสอบความถูกต้องของการแก้ไข"
  },
  "PENDING": {
    key: "PENDING",
    th: "รอดำเนินการเพิ่มเติม",
    color: "bg-orange-100 text-orange-800",
    order: 4,
    description: "รอดำเนินการจาก user หรือบุคคลอื่น"
  },
  "DONE": {
    key: "DONE",
    th: "สำเร็จ",
    color: "bg-green-100 text-green-800",
    order: 5,
    description: "แก้ไขเสร็จแล้ว"
  },
  "CANCEL": {
    key: "CANCEL",
    th: "ยกเลิก",
    color: "bg-red-100 text-red-800",
    order: 6,
    description: "ยกเลิก ticket"
  }
};

// Export as array for frontend (sorted by order)
const STATUS_OPTIONS = Object.values(STATUS_CONFIG).sort((a, b) => a.order - b.order);

module.exports = {
  STATUS_CONFIG,
  STATUS_OPTIONS,
  // Helper function: get status by key
  getStatus: (key) => STATUS_CONFIG[key] || { th: key, color: "bg-gray-100 text-gray-800" }
};
