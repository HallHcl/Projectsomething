import React, { useEffect, useState } from "react";
import UserNav from "../src/components/UserNav";

const API_URL = "http://localhost:5000/api/tickets";

export default function TicketHistory() {
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusConfig, setStatusConfig] = useState([]);

  const ITEMS_PER_PAGE = 10;

  // โหลด user info
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        setUser(JSON.parse(raw));
      }
    } catch (err) {
      console.error("Cannot parse user from localStorage", err);
    }
  }, []);

  // Fetch status config จาก API
  useEffect(() => {
    const fetchStatusConfig = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/config/statuses");
        const data = await res.json();
        setStatusConfig(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("fetch status config error:", err);
      }
    };
    fetchStatusConfig();
  }, []);

  // โหลด tickets
  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const skip = (currentPage - 1) * ITEMS_PER_PAGE;

        let url = `${API_URL}/user/me?limit=${ITEMS_PER_PAGE}&skip=${skip}`;
        if (statusFilter) {
          url += `&status=${statusFilter}`;
        }

        const res = await fetch(url, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "เกิดข้อผิดพลาด");
        }

        // Debug: log response
        console.log("getUserTickets response:", data);

        // API return { tickets: [...], total: N }
        const ticketsArray = Array.isArray(data) ? data : (data.tickets || []);
        setTickets(ticketsArray);

        // คำนวณจำนวนหน้า
        const total = data.total || ticketsArray.length;
        const pages = Math.ceil(total / ITEMS_PER_PAGE);
        setTotalPages(pages || 1);
      } catch (error) {
        console.error("fetch tickets error:", error);
        alert(`เกิดข้อผิดพลาด: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user, currentPage, statusFilter]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FF]">
        <div className="text-center text-gray-600">กำลังโหลดข้อมูลผู้ใช้…</div>
      </div>
    );
  }

  // ฟังก์ชันแปลง status เป็น Thai + เลือกสี (ดึงจาก statusConfig ที่ fetch มาจาก API)
  const getStatusBadge = (status) => {
    const statusInfo = statusConfig.find((s) => s.key === status);
    if (statusInfo) {
      return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
          {statusInfo.th}
        </span>
      );
    }
    // fallback
    return <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-gray-100 text-gray-800 border-gray-300">{status}</span>;
  };

  // format datetime
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FF]">
      <UserNav />
      <div className="py-10 px-4">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border-t-8" style={{ borderTopColor: "#003CFF" }}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#003CFF]">ประวัติ Ticket</h1>
          <span className="text-gray-600">ผู้ใช้: <span className="font-medium">{user.email}</span></span>
        </div>

        {/* Filter by Status */}
        <div className="mb-6 flex gap-3 items-center">
          <label className="font-medium text-gray-700">กรองตามสถานะ:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1); // reset หน้า
            }}
            className="px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#003CFF] focus:outline-none"
          >
            <option value="">-- ทั้งหมด --</option>
            {statusConfig.map((status) => (
              <option key={status.key} value={status.key}>
                {status.th}
              </option>
            ))}
          </select>
        </div>

        {/* Loading */}
        {loading && <div className="text-center py-8 text-gray-500">กำลังโหลด…</div>}

        {/* Tickets Table */}
        {!loading && tickets.length > 0 && (
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">หมายเลข Ticket</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">ประเภทปัญหา</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">สาขา</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">สถานะ</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">วันที่สร้าง</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">การกระทำ</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket, idx) => (
                  <tr key={ticket._id || idx} className="border-b hover:bg-blue-50 transition">
                    <td className="px-4 py-3 font-mono text-blue-600 font-medium">{ticket.ticketNumber || ticket.ticketKey || "-"}</td>
                    <td className="px-4 py-3 text-gray-800">{ticket.issueType || "-"}</td>
                    <td className="px-4 py-3 text-gray-800">{ticket.branchName || ticket.branchCode || "-"}</td>
                    <td className="px-4 py-3">{getStatusBadge(ticket.status || "WAIT FOR SUPPORT")}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{formatDate(ticket.createdAt)}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => {
                          if (!ticket._id) {
                            alert("ไม่สามารถโหลดรายละเอียด Ticket ได้");
                            return;
                          }
                          // TODO: navigate to ticket detail / modal or show in side panel
                          alert(`ดูรายละเอียด: ${ticket.ticketNumber || ticket.ticketKey || ticket._id}`);
                        }}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition"
                      >
                        ดู
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty state */}
        {!loading && tickets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">ไม่พบ Ticket ที่ตรงกับเงื่อนไข</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
            >
              ← ก่อนหน้า
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded ${
                    currentPage === page
                      ? "bg-[#003CFF] text-white font-semibold"
                      : "border hover:bg-gray-100"
                  } transition`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
            >
              ถัดไป →
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
