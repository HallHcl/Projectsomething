import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserNav from "../src/components/UserNav";

const API_URL = "http://localhost:5000/api/tickets";

export default function OpenTicket() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [anydeskNumber, setAnydeskNumber] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [details, setDetails] = useState("");

  const [branches, setBranches] = useState([]);
  const [isEditingBranch, setIsEditingBranch] = useState(false);
  const [selectedBranchCode, setSelectedBranchCode] = useState("");
  const [branchSearchInput, setBranchSearchInput] = useState("");
  const [filteredBranches, setFilteredBranches] = useState([]);

  const [files, setFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  const [issueOptions, setIssueOptions] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [statusConfig, setStatusConfig] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      console.error("parse user", e);
    }
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/branches")
      .then((r) => r.json())
      .then((data) => setBranches(data || []))
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    if (!branchSearchInput.trim()) return setFilteredBranches([]);
    const q = branchSearchInput.toLowerCase();
    setFilteredBranches(
      branches.filter((b) => b.code.toLowerCase().includes(q) || b.name.toLowerCase().includes(q))
    );
  }, [branchSearchInput, branches]);

  useEffect(() => {
    fetch("http://localhost:5000/api/issueOptions")
      .then((r) => r.json())
      .then((data) => setIssueOptions(data || []))
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/config/statuses")
      .then((r) => r.json())
      .then((data) => setStatusConfig(Array.isArray(data) ? data : []))
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/user/me/recent`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => r.json())
      .then((data) => setRecentTickets(Array.isArray(data) ? data : data.tickets || []))
      .catch((e) => console.error(e));
  }, [user]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    const newPreviews = selected.map((f) => URL.createObjectURL(f));
    setFiles((p) => [...p, ...selected]);
    setPreviewImages((p) => [...p, ...newPreviews]);
  };

  const handleRemoveImage = (index) => {
    setPreviewImages((prev) => {
      try { URL.revokeObjectURL(prev[index]); } catch (e) {}
      return prev.filter((_, i) => i !== index);
    });
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => () => previewImages.forEach((p) => { try { URL.revokeObjectURL(p); } catch (e) {} }), [previewImages]);

  const validate = () => {
    if (!category) return "กรุณาเลือกประเภทปัญหา";
    if (!subCategory) return "กรุณาเลือกหัวข้อย่อยของปัญหา";
    if (!details || details.trim().length < 10) return "รายละเอียดปัญหาต้องมีอย่างน้อย 10 ตัวอักษร";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return alert(err);
    if (!user || !user.branchCode) return alert("ไม่พบข้อมูลสาขาในข้อมูลผู้ใช้ (user) กรุณาล็อกอินใหม่");

    const payload = {
      branchCode: user.branchCode,
      branchName: user.branchName || "",
      anydeskNumber: anydeskNumber || "",
      issueType: category,
      subIssue: subCategory,
      details: details.trim(),
      attachedFile: files.length > 0 ? files[0].name : null,
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "เกิดข้อผิดพลาด");
      console.log("Ticket created response:", data);
      const ticketNum = data.ticket?.ticketNumber || data.ticketNumber || "N/A";
      alert(`ส่ง Ticket สำเร็จ! หมายเลข: ${ticketNum}`);
      previewImages.forEach((p) => { try { URL.revokeObjectURL(p); } catch (e) {} });
      setFiles([]); setPreviewImages([]); setCategory(""); setSubCategory(""); setDetails(""); setAnydeskNumber("");
    } catch (error) {
      console.error("send ticket error:", error);
      alert(`เกิดข้อผิดพลาดขณะส่ง Ticket: ${error.message}`);
    }
  };

  const getStatusBadge = (status) => {
    const s = statusConfig.find((x) => x.key === status);
    if (s) return <span className={`px-2 py-1 rounded text-xs font-semibold ${s.color}`}>{s.th}</span>;
    return <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800">{status}</span>;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try { const d = new Date(dateStr); return d.toLocaleDateString("th-TH", { month: "short", day: "2-digit" }); } catch (e) { return dateStr; }
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FF]"><div className="text-center text-gray-600">กำลังโหลดข้อมูลผู้ใช้…</div></div>
  );

  return (
    <div className="min-h-screen bg-[#F5F7FF]">
      <UserNav />
      <div className="py-10 px-4">
        <div className="max-w-4xl mx-auto">

          <div className="bg-white rounded-2xl shadow-2xl p-8 border-t-8" style={{ borderTopColor: "#003CFF" }}>
            <h1 className="text-3xl font-bold text-[#003CFF] mb-2">เปิด Ticket แจ้งปัญหา</h1>
            <p className="text-gray-600 mb-6">ผู้ใช้งาน: <span className="font-medium">{user.fullName || user.name || "-"}</span></p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="font-medium text-gray-700">สาขา</label>
                <div className="flex items-center gap-3">
                  <input type="text" value={`${user.branchCode || ""}${user.branchName ? " - " + user.branchName : ""}`} disabled className="flex-1 mt-1 p-3 rounded-lg border bg-gray-100 text-gray-700" />
                  <button type="button" onClick={() => setIsEditingBranch(true)} className="mt-1 px-3 py-2 bg-gray-200 rounded hover:bg-gray-300" title="แก้ไขสาขา">✎</button>
                </div>

                {isEditingBranch && (
                  <div className="mt-2 space-y-2">
                    <div className="relative z-20">
                      <input type="text" value={branchSearchInput} onChange={(e) => setBranchSearchInput(e.target.value)} placeholder="พิมพ์รหัสสาขา หรือชื่อสาขา (เช่น BKK, ไทรน้อย)" className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-[#003CFF] focus:outline-none" />
                      {filteredBranches.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto">
                          {filteredBranches.map((b) => (
                            <button key={b.code} type="button" onClick={() => { setSelectedBranchCode(b.code); setBranchSearchInput(`${b.code} - ${b.name}`); setFilteredBranches([]); }} className="w-full text-left px-4 py-3 hover:bg-blue-100 border-b last:border-b-0 transition">
                              <span className="font-medium text-gray-800">{b.code}</span>
                              <span className="text-gray-600 ml-2">- {b.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {branchSearchInput.trim() && filteredBranches.length === 0 && !selectedBranchCode && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg p-3 text-gray-500 text-sm shadow-lg z-50">ไม่พบสาขาที่ตรงกัน</div>
                      )}
                    </div>

                    {selectedBranchCode && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-gray-600">เลือกแล้ว:</p>
                        <p className="font-medium text-blue-700">{branches.find((b) => b.code === selectedBranchCode)?.code} - {branches.find((b) => b.code === selectedBranchCode)?.name}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button type="button" onClick={async () => {
                        if (!selectedBranchCode) return alert("กรุณาเลือกสาขาก่อนอัปเดต");
                        try {
                          const token = localStorage.getItem("token");
                          const sel = branches.find((b) => b.code === selectedBranchCode);
                          const payload = { branchCode: sel.code, branchName: sel.name };
                          const r = await fetch("http://localhost:5000/api/user/branch", { method: "PATCH", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(payload) });
                          const data = await r.json();
                          if (!r.ok) throw new Error(data.message || "Update failed");
                          const updatedUser = data.user || data;
                          localStorage.setItem("user", JSON.stringify(updatedUser));
                          setUser(updatedUser); setIsEditingBranch(false); setBranchSearchInput(""); setSelectedBranchCode("");
                        } catch (err) { console.error(err); alert(err.message || "ไม่สามารถอัปเดตสาขาได้"); }
                      }} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">บันทึก</button>

                      <button type="button" onClick={() => { setIsEditingBranch(false); setBranchSearchInput(""); setSelectedBranchCode(""); setFilteredBranches([]); }} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition">ยกเลิก</button>
                    </div>
                  </div>
                )}

                <p className="text-sm text-gray-500 mt-2">คุณอยู่สาขาเดิมใช่หรือไม่? หากไม่อยู่ กรุณาอัปเดต</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-gray-700">หมายเลข AnyDesk</label>
                  <input type="text" value={anydeskNumber} onChange={(e) => setAnydeskNumber(e.target.value)} placeholder="เช่น 123 456 789" className="w-full mt-1 p-3 rounded-lg border focus:ring-2 focus:ring-[#FF2E98]" />
                </div>

                <div>
                  <label className="font-medium text-gray-700">ประเภทปัญหา</label>
                  <select value={category} onChange={(e) => { setCategory(e.target.value); setSubCategory(""); }} className="w-full mt-1 p-3 rounded-lg border focus:ring-2 focus:ring-[#003CFF]" required>
                    <option value="">-- เลือกประเภทปัญหา --</option>
                    {issueOptions.map((opt) => <option value={opt.category} key={opt.category}>{opt.category}</option>)}
                  </select>
                </div>
              </div>

              {category && (
                <div>
                  <label className="font-medium text-gray-700">หัวข้อย่อยของปัญหา</label>
                  <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className="w-full mt-1 p-3 rounded-lg border focus:ring-2 focus:ring-[#003CFF]" required>
                    <option value="">-- เลือกหัวข้อย่อย --</option>
                    {issueOptions.find((opt) => opt.category === category)?.subOptions.map((sub, idx) => <option value={sub} key={idx}>{sub}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="font-medium text-gray-700">รายละเอียดปัญหา</label>
                <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={4} placeholder="อธิบายเหตุการ์ณก่อนที่ปัญหาจะเกิดขึ้น (อย่างน้อย 10 ตัวอักษร)" className="w-full mt-1 p-3 rounded-lg border focus:ring-2 focus:ring-[#FF2E98]" required />
              </div>

              <div>
                <label className="font-medium text-gray-700">สามารถแนปรูปภาพได้</label>
                <input type="file" accept="image/*" multiple onChange={handleFileChange} className="w-full mt-2" />
                {previewImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {previewImages.map((src, i) => (
                      <div key={i} className="relative group">
                        <img src={src} alt={`preview-${i}`} className="w-full h-32 object-cover rounded-lg shadow" />
                        <button type="button" onClick={() => handleRemoveImage(i)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm shadow hover:bg-red-600" title="ลบรูป">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-[#003CFF] to-[#FF2E98] text-white text-lg font-semibold shadow-lg hover:opacity-90 transition">ส่ง Ticket</button>
              </div>
            </form>
          </div>

          {recentTickets.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mt-6 border-l-4" style={{ borderLeftColor: "#FF2E98" }}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Ticket ล่าสุด</h2>
                <button type="button" onClick={() => navigate("/ticketHistory")} className="text-sm px-4 py-2 bg-gradient-to-r from-[#003CFF] to-[#FF2E98] text-white rounded-lg hover:opacity-90 transition">ดูทั้งหมด →</button>
              </div>
              <div className="space-y-2">
                {recentTickets.slice(0, 5).map((ticket) => (
                  <div key={ticket._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex-1">
                      <p className="font-mono text-blue-600 font-medium text-sm">{ticket.ticketNumber || ticket.ticketKey || "-"}</p>
                      <p className="text-gray-600 text-xs">{ticket.issueType}</p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(ticket.status || "WAIT FOR SUPPORT")}
                      <p className="text-gray-500 text-xs mt-1">{formatDate(ticket.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}