import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/tickets"; // <-- เปลี่ยนตาม backend ของคุณถ้าจำเป็น

export default function OpenTicket() {
  // user info (จาก localStorage ที่คุณเก็บตอน login)
  const [user, setUser] = useState(null);

  // ฟอร์ม
  const [anydeskNumber, setAnydeskNumber] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [details, setDetails] = useState("");

  // branch editing
  const [branches, setBranches] = useState([]);
  const [isEditingBranch, setIsEditingBranch] = useState(false);
  const [selectedBranchCode, setSelectedBranchCode] = useState("");
  const [branchSearchInput, setBranchSearchInput] = useState("");
  const [filteredBranches, setFilteredBranches] = useState([]);

  // ไฟล์ + preview
  const [files, setFiles] = useState([]); // เก็บ File objects
  const [previewImages, setPreviewImages] = useState([]); // เก็บ object URLs

  // --- options ตามที่คุณยืนยันว่าส่งให้ตรงนี้เท่านั้น ---
  const options = {
    Hardware: [
      "คอมเปิดไม่ติด",
      "จอภาพเป็นเส้น / สีเพี้ยน",
      "เครื่องดับเอง",
      "ดู preview รูปภาพไม่ได้",
    ],
    Software: [
      "ติดตั้งโปรแกรม",
      "ถอนการติดตั้งโปรแกรม",
      "Email ส่งไม่ได้ / รับไม่ได้",
    ],
    Network: [
      "กล้อง CCTV ดูไม่ได้",
      "เชื่อมต่อ Wi-Fi ไม่ได้",
      "VPN ต่อไม่ได้",
    ],
    Printer: [
      "สแกนไม่ได้",
      "เครื่องปริ้นไม่ออกกระดาษ",
      "หมึกไม่ออก / หมึกจาง",
    ],
    Other: [
      "อื่นๆ (โปรดระบุในรายละเอียด)",
      "ขอ Reset Password",
      "ขอ เบิก/เปลี่ยนอุปกรณ์",
    ],
  };
  // ----------------------------------------------------------------

  // โหลด user จาก localStorage (สมมติเก็บเป็น JSON string under "user")
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed);
      } else {
        // ถ้าคุณต้องการ fallback: fetch จาก /api/user/me โดย token
        // const token = localStorage.getItem("token");
        // axios.get("/api/user/me", { headers: { Authorization: `Bearer ${token}` }})
        //   .then(r => setUser(r.data)).catch(()=>{})
      }
    } catch (err) {
      console.error("Cannot parse user from localStorage", err);
    }
  }, []);

  // fetch branches list for dropdown
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/branches");
        const data = await res.json();
        setBranches(data || []);
      } catch (err) {
        console.error("fetch branches error:", err);
      }
    };
    fetchBranches();
  }, []);

  // Filter branches ขณะพิมพ์ (case-insensitive search)
  useEffect(() => {
    if (!branchSearchInput.trim()) {
      setFilteredBranches([]);
      return;
    }
    const query = branchSearchInput.toLowerCase();
    const filtered = branches.filter(
      (b) =>
        b.code.toLowerCase().includes(query) ||
        b.name.toLowerCase().includes(query)
    );
    setFilteredBranches(filtered);
  }, [branchSearchInput, branches]);

  // สร้าง preview URLs และเก็บ File objects
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    // สร้าง object URLs สำหรับ preview
    const newPreviews = selected.map((f) => URL.createObjectURL(f));

    setFiles((prev) => [...prev, ...selected]);
    setPreviewImages((prev) => [...prev, ...newPreviews]);
  };

  // ลบรูปทีละรูป (ทั้ง preview และ file object)
  const handleRemoveImage = (index) => {
    setPreviewImages((prev) => {
      // revoke URL ของรูปที่จะลบ
      try {
        URL.revokeObjectURL(prev[index]);
      } catch (e) {}
      return prev.filter((_, i) => i !== index);
    });

    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ป้องกัน memory leak: revoke ทุก URL เมื่อ component unmount
  useEffect(() => {
    return () => {
      previewImages.forEach((p) => {
        try {
          URL.revokeObjectURL(p);
        } catch (e) {}
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // validation
  const validate = () => {
    if (!category) return "กรุณาเลือกประเภทปัญหา";
    if (!subCategory) return "กรุณาเลือกหัวข้อย่อยของปัญหา";
    if (!details || details.trim().length < 10) return "รายละเอียดปัญหาต้องมีอย่างน้อย 10 ตัวอักษร";
    // anydesk optional? ถ้าต้องการบังคับ uncomment ด้านล่าง
    // if (!anydeskNumber.trim()) return "กรุณากรอกหมายเลข AnyDesk";
    return null;
  };

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = validate();
    if (err) {
      alert(err);
      return;
    }

    // สร้าง FormData
    const formData = new FormData();

    // branchCode มาจาก user (read-only)
    if (!user || !user.branchCode) {
      alert("ไม่พบข้อมูลสาขาในข้อมูลผู้ใช้ (user) กรุณาล็อกอินใหม่");
      return;
    }
    formData.append("branchCode", user.branchCode);

    // anydesk (ส่งถ้ามี)
    formData.append("anydeskNumber", anydeskNumber || "");

    // issue fields
    formData.append("issueType", category);
    formData.append("subIssue", subCategory);
    formData.append("details", details.trim());

    // files -> append many (ชื่อ field 'files' หรือเปลี่ยนตาม backend ของคุณ)
    files.forEach((f) => formData.append("files", f));

    try {
      const token = localStorage.getItem("token");
      await axios.post(API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      alert("ส่ง Ticket สำเร็จ!");

      // reset form (และ revoke preview URLs ของที่เหลือ)
      previewImages.forEach((p) => {
        try {
          URL.revokeObjectURL(p);
        } catch (e) {}
      });

      setFiles([]);
      setPreviewImages([]);
      setCategory("");
      setSubCategory("");
      setDetails("");
      setAnydeskNumber("");
    } catch (error) {
      console.error("send ticket error:", error);
      alert("เกิดข้อผิดพลาดขณะส่ง Ticket กรุณาลองใหม่");
    }
  };

  // ถ้ายังโหลด user อยู่
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FF]">
        <div className="text-center text-gray-600">กำลังโหลดข้อมูลผู้ใช้…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FF] py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border-t-8" style={{ borderTopColor: "#003CFF" }}>
        <h1 className="text-3xl font-bold text-[#003CFF] mb-2">เปิด Ticket แจ้งปัญหา</h1>
        <p className="text-gray-600 mb-6">ผู้ใช้งาน: <span className="font-medium">{user.fullName || user.name || "-"}</span></p>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* สาขา (read-only -> inline edit) */}
          <div>
            <label className="font-medium text-gray-700">สาขา</label>

            {!isEditingBranch && (
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={`${user.branchCode || ""}${user.branchName ? " - " + user.branchName : ""}`}
                  disabled
                  className="flex-1 mt-1 p-3 rounded-lg border bg-gray-100 text-gray-700"
                />
                <button
                  type="button"
                  onClick={() => setIsEditingBranch(true)}
                  className="mt-1 px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  title="แก้ไขสาขา"
                >
                  ✎
                </button>
              </div>
            )}

            {isEditingBranch && (
              <div className="mt-2 space-y-2">
                {/* Autocomplete Input */}
                <div className="relative z-20">
                  <input
                    type="text"
                    value={branchSearchInput}
                    onChange={(e) => setBranchSearchInput(e.target.value)}
                    placeholder="พิมพ์รหัสสาขา หรือชื่อสาขา (เช่น BKK, ไทรน้อย)"
                    className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-[#003CFF] focus:outline-none"
                  />

                  {/* Filtered Dropdown */}
                  {filteredBranches.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto">
                      {filteredBranches.map((b) => (
                        <button
                          key={b.code}
                          type="button"
                          onClick={() => {
                            setSelectedBranchCode(b.code);
                            setBranchSearchInput(`${b.code} - ${b.name}`);
                            setFilteredBranches([]);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-blue-100 border-b last:border-b-0 transition"
                        >
                          <span className="font-medium text-gray-800">{b.code}</span> 
                          <span className="text-gray-600 ml-2">- {b.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* No Results Message */}
                  {branchSearchInput.trim() && filteredBranches.length === 0 && !selectedBranchCode && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg p-3 text-gray-500 text-sm shadow-lg z-50">
                      ไม่พบสาขาที่ตรงกัน
                    </div>
                  )}
                </div>

                {/* Selected Branch Display */}
                {selectedBranchCode && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600">เลือกแล้ว:</p>
                    <p className="font-medium text-blue-700">
                      {branches.find((b) => b.code === selectedBranchCode)?.code} -{" "}
                      {branches.find((b) => b.code === selectedBranchCode)?.name}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={async () => {
                      // save selection
                      if (!selectedBranchCode) {
                        alert("กรุณาเลือกสาขาก่อนอัปเดต");
                        return;
                      }
                      try {
                        const token = localStorage.getItem("token");
                        const sel = branches.find((b) => b.code === selectedBranchCode);
                        const payload = { branchCode: sel.code, branchName: sel.name };
                        await fetch("http://localhost:5000/api/user/branch", {
                          method: "PATCH",
                          headers: {
                            "Content-Type": "application/json",
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                          },
                          body: JSON.stringify(payload),
                        }).then(async (r) => {
                          const data = await r.json();
                          if (!r.ok) throw new Error(data.message || "Update failed");
                          // update localStorage and local state
                          const updatedUser = data.user || data;
                          localStorage.setItem("user", JSON.stringify(updatedUser));
                          setUser(updatedUser);
                          setIsEditingBranch(false);
                          setBranchSearchInput("");
                          setSelectedBranchCode("");
                        });
                      } catch (err) {
                        console.error(err);
                        alert(err.message || "ไม่สามารถอัปเดตสาขาได้");
                      }
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                  >
                    บันทึก
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingBranch(false);
                      setBranchSearchInput("");
                      setSelectedBranchCode("");
                      setFilteredBranches([]);
                    }}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            )}

            <p className="text-sm text-gray-500 mt-2">คุณอยู่สาขาเดิมใช่หรือไม่? หากไม่อยู่ กรุณาอัปเดต</p>
          </div>

          {/* 2-column: AnyDesk + Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-gray-700">หมายเลข AnyDesk</label>
              <input
                type="text"
                value={anydeskNumber}
                onChange={(e) => setAnydeskNumber(e.target.value)}
                placeholder="เช่น 123 456 789"
                className="w-full mt-1 p-3 rounded-lg border focus:ring-2 focus:ring-[#FF2E98]"
              />
            </div>

            <div>
              <label className="font-medium text-gray-700">ประเภทปัญหา</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSubCategory(""); // reset sub
                }}
                className="w-full mt-1 p-3 rounded-lg border focus:ring-2 focus:ring-[#003CFF]"
                required
              >
                <option value="">-- เลือกประเภทปัญหา --</option>
                <option value="Hardware">🖥 Hardware</option>
                <option value="Software">💾 Software</option>
                <option value="Network">🌐 Network</option>
                <option value="Printer">🖨 Printer</option>
                <option value="Other">อื่นๆ</option>
              </select>
            </div>
          </div>

          {/* Sub-category (show when category selected) */}
          {category && (
            <div>
              <label className="font-medium text-gray-700">หัวข้อย่อยของปัญหา</label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full mt-1 p-3 rounded-lg border focus:ring-2 focus:ring-[#003CFF]"
                required
              >
                <option value="">-- เลือกหัวข้อย่อย --</option>
                {options[category].map((opt, idx) => (
                  <option value={opt} key={idx}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Details */}
          <div>
            <label className="font-medium text-gray-700">รายละเอียดปัญหา</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              placeholder="อธิบายเหตุการ์ณก่อนที่ปัญหาจะเกิดขึ้น (อย่างน้อย 10 ตัวอักษร)"
              className="w-full mt-1 p-3 rounded-lg border focus:ring-2 focus:ring-[#FF2E98]"
              required
            />
          </div>

          {/* File upload + preview */}
          <div>
            <label className="font-medium text-gray-700">สามารถแนปรูปภาพได้ </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="w-full mt-2"
            />

            {previewImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {previewImages.map((src, i) => (
                  <div key={i} className="relative group">
                    <img src={src} alt={`preview-${i}`} className="w-full h-32 object-cover rounded-lg shadow" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm shadow hover:bg-red-600"
                      title="ลบรูป"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#003CFF] to-[#FF2E98] text-white text-lg font-semibold shadow-lg hover:opacity-90 transition"
            >
              ส่ง Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
