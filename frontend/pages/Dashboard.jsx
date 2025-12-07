import React, { useEffect, useState } from "react";
import UserNav from "../src/components/UserNav";

const API_URL = "http://localhost:5000/api/tickets";

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/overview`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Error fetching overview");
        setOverview(data);
      } catch (err) {
        console.error("fetch overview error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F7FF]">
      <UserNav />
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-[#003CFF] mb-6">Overview Dashboard</h1>

        {loading && <div className="text-gray-600">กำลังโหลด...</div>}

        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">Total Tickets</div>
              <div className="text-2xl font-bold mt-2">{overview.total}</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">Tickets รอ IT</div>
              <div className="text-2xl font-bold mt-2">{overview.counts?.["WAIT FOR SUPPORT"] || 0}</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">Tickets ดำเนินการอยู่</div>
              <div className="text-2xl font-bold mt-2">{overview.counts?.["WORK IN PROGRESS"] || 0}</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">Tickets ปิดแล้ว</div>
              <div className="text-2xl font-bold mt-2">{overview.counts?.["DONE"] || 0}</div>
            </div>

            <div className="col-span-1 md:col-span-4 mt-4">
              <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">การแจ้งเตือนใหม่</div>
                  <div className="text-xl font-bold mt-1">{overview.newNotifications || 0}</div>
                </div>
                <div>
                  <button className="px-4 py-2 bg-[#003CFF] text-white rounded">ดูการแจ้งเตือน</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
