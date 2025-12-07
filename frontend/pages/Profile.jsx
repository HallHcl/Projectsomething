import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import UserNav from "../src/components/UserNav";
import { ThemeContext } from "../src/context/ThemeContext";
import { t } from "../src/utils/translations";

export default function Profile() {
  const navigate = useNavigate();
  const { language, setLanguage } = useContext(ThemeContext);

  const [user, setUser] = useState(null);
  const [localLanguage, setLocalLanguage] = useState("th");
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [editPhone, setEditPhone] = useState("");
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ticketStats, setTicketStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed);
        setEditPhone(parsed.phone || "");
        setLocalLanguage(parsed.language || "th");
        setPreviewImage(parsed.profileImage || null);
      }
    } catch (e) {
      console.error("parse user", e);
    }
  }, []);

  // Keep local language in sync with context changes
  useEffect(() => {
    setLocalLanguage(language || "th");
  }, [language]);

  useEffect(() => {
    if (!user) return;
    const fetchTicketStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/tickets/overview", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        setTicketStats(data);
      } catch (e) {
        console.error("fetch stats", e);
      }
    };
    fetchTicketStats();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchRecentTickets = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/tickets/user/me/recent", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        setRecentTickets(Array.isArray(data) ? data : data.tickets || []);
      } catch (e) {
        console.error("fetch recent", e);
      }
    };
    fetchRecentTickets();
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setPreviewImage(evt.target.result);
      setProfileImage(file);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      if (profileImage) formData.append("profileImage", profileImage);
      formData.append("phone", editPhone);
      formData.append("language", localLanguage);

      const res = await fetch("http://localhost:5000/api/user/profile", {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) throw new Error("Update failed");
      const data = await res.json();
      const updated = data.user || data;
      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);
      setIsEditingPhone(false);
      setProfileImage(null);
      alert(t(localLanguage, "success"));
    } catch (e) {
      console.error("save profile", e);
      alert(`${t(localLanguage, "error")}: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      alert(t(localLanguage, "newPassword"));
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert(t(localLanguage, "passwordMismatch"));
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Change password failed");
      }
      alert(t(localLanguage, "success"));
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setIsChangingPassword(false);
    } catch (e) {
      console.error("change password", e);
      alert(`${t(localLanguage, "error")}: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm(t(localLanguage, "confirmLogout"))) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(localLanguage === "th" ? "th-TH" : "en-US", { month: "short", day: "2-digit", year: "numeric" });
    } catch (e) {
      return dateStr;
    }
  };

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-[#F5F7FF]`}>
        <div className={`text-center text-gray-600`}>{t(localLanguage, "loading")}</div>
      </div>
    );
  }

  const bgClass = "bg-white";
  const textClass = "text-gray-800";
  const inputClass = "bg-white text-gray-800 border-gray-300";
  const labelClass = "text-gray-600";

  return (
    <div className={`min-h-screen bg-[#F5F7FF]`}>
      <UserNav />
      <div className="py-10 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Profile Header */}
          <div className={`${bgClass} rounded-2xl shadow-2xl p-8 mb-6 border-t-8`} style={{ borderTopColor: "#003CFF" }}>
            <div className="flex items-start gap-8">
              {/* Profile Image */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#003CFF] to-[#FF2E98] flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                  {previewImage ? (
                    <img src={previewImage} alt="profile" className="w-full h-full object-cover" />
                  ) : (
                    (user.fullName || user.email || "U").charAt(0).toUpperCase()
                  )}
                </div>
                <label className="mt-3 px-3 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition text-sm">
                  {t(localLanguage, "changeImage")}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <h1 className={`text-3xl font-bold text-[#003CFF] mb-2`}>{user.fullName || user.email || "User"}</h1>
                <p className={labelClass + " mb-4"}>{user.email}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-xs ${labelClass}`}>{t(localLanguage, "employeeId")}</p>
                    <p className={`font-medium ${textClass}`}>{user.employeeId || "-"}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${labelClass}`}>{t(localLanguage, "position")}</p>
                    <p className={`font-medium ${textClass}`}>{user.position || "-"}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${labelClass}`}>{t(localLanguage, "department")}</p>
                    <p className={`font-medium ${textClass}`}>{user.department || "-"}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${labelClass}`}>{t(localLanguage, "branch")}</p>
                    <p className={`font-medium ${textClass}`}>{user.branchName || "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Phone */}
          <div className={`${bgClass} rounded-2xl shadow-lg p-6 mb-6`}>
            <h2 className="text-xl font-bold text-[#003CFF] mb-4">{t(localLanguage, "contactInfo")}</h2>
            <div className="space-y-4">
              <div>
                <label className={`text-sm ${labelClass}`}>{t(localLanguage, "email")}</label>
                <p className={`font-medium ${textClass}`}>{user.email}</p>
              </div>

              <div>
                <label className={`text-sm ${labelClass}`}>{t(localLanguage, "phone")}</label>
                {isEditingPhone ? (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="08x-xxx-xxxx"
                      className={`flex-1 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-[#003CFF] ${inputClass}`}
                    />
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {t(localLanguage, "save")}
                    </button>
                    <button
                      onClick={() => { setIsEditingPhone(false); setEditPhone(user.phone || ""); }}
                      className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                    >
                      {t(localLanguage, "cancel")}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-2">
                    <p className={`font-medium ${textClass}`}>{user.phone || t(localLanguage, "notSpecified")}</p>
                    <button
                      onClick={() => setIsEditingPhone(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      {t(localLanguage, "edit")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ticket Statistics */}
          {ticketStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className={`${bgClass} rounded-lg shadow p-6 border-l-4`} style={{ borderLeftColor: "#003CFF" }}>
                <p className={`text-xs ${labelClass}`}>{t(localLanguage, "totalTickets")}</p>
                <p className="text-2xl font-bold text-[#003CFF]">{ticketStats.totalTickets || 0}</p>
              </div>
              <div className={`${bgClass} rounded-lg shadow p-6 border-l-4`} style={{ borderLeftColor: "#FF9800" }}>
                <p className={`text-xs ${labelClass}`}>{t(localLanguage, "inProgress")}</p>
                <p className="text-2xl font-bold text-[#FF9800]">{ticketStats.inProgress || 0}</p>
              </div>
              <div className={`${bgClass} rounded-lg shadow p-6 border-l-4`} style={{ borderLeftColor: "#4CAF50" }}>
                <p className={`text-xs ${labelClass}`}>{t(localLanguage, "resolved")}</p>
                <p className="text-2xl font-bold text-[#4CAF50]">{ticketStats.resolved || 0}</p>
              </div>
              <div className={`${bgClass} rounded-lg shadow p-6 border-l-4`} style={{ borderLeftColor: "#9C27B0" }}>
                <p className={`text-xs ${labelClass}`}>{t(localLanguage, "closed")}</p>
                <p className="text-2xl font-bold text-[#9C27B0]">{ticketStats.closed || 0}</p>
              </div>
            </div>
          )}

          {/* Recent Tickets */}
          {recentTickets.length > 0 && (
            <div className={`${bgClass} rounded-2xl shadow-lg p-6 mb-6`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#003CFF]">{t(localLanguage, "recentTickets")}</h2>
                <button
                  onClick={() => navigate("/ticketHistory")}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {t(localLanguage, "seeAll")} →
                </button>
              </div>
              <div className="space-y-3">
                {recentTickets.slice(0, 5).map((ticket) => (
                  <div key={ticket._id} className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition`}>
                    <div className="flex-1">
                      <p className="font-mono text-blue-600 font-medium text-sm">{ticket.ticketNumber || ticket.ticketKey || "-"}</p>
                      <p className={`text-gray-600 text-xs`}>{ticket.issueType}</p>
                    </div>
                    <p className={`text-gray-500 text-xs`}>{formatDate(ticket.createdAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preferences */}
          <div className={`${bgClass} rounded-2xl shadow-lg p-6 mb-6`}>
            <h2 className="text-xl font-bold text-[#003CFF] mb-4">{t(localLanguage, "preferences")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <div>
                <label className={`block text-sm ${labelClass} mb-2`}>{t(localLanguage, "language")}</label>
                <select
                    value={localLanguage}
                    onChange={(e) => {
                        setLocalLanguage(e.target.value);
                        setLanguage(e.target.value); // ⭐ update language ทันที
                    }}
                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-[#003CFF] ${inputClass}`}
                    >

                  <option value="th">{t(localLanguage, "thai")}</option>
                  <option value="en">{t(localLanguage, "english")}</option>
                </select>
              </div>
            </div>
         
          </div>

          {/* Password */}
          <div className={`${bgClass} rounded-2xl shadow-lg p-6 mb-6`}>
            <h2 className="text-xl font-bold text-[#003CFF] mb-4">{t(localLanguage, "accountSettings")}</h2>
            {isChangingPassword ? (
              <div className="space-y-4">
                <div>
                  <label className={`text-sm ${labelClass}`}>{t(localLanguage, "currentPassword")}</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className={`w-full mt-1 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-[#003CFF] ${inputClass}`}
                  />
                </div>
                <div>
                  <label className={`text-sm ${labelClass}`}>{t(localLanguage, "newPassword")}</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className={`w-full mt-1 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-[#003CFF] ${inputClass}`}
                  />
                </div>
                <div>
                  <label className={`text-sm ${labelClass}`}>{t(localLanguage, "confirmPassword")}</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className={`w-full mt-1 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-[#003CFF] ${inputClass}`}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? t(localLanguage, "savingSettings") : t(localLanguage, "changePasswordButton")}
                  </button>
                  <button
                    onClick={() => { setIsChangingPassword(false); setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" }); }}
                    className="flex-1 px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                  >
                    {t(localLanguage, "cancel")}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-left"
              >
                🔐 {t(localLanguage, "changePassword")}
              </button>
            )}
          </div>

          {/* Logout */}
          <div className={`${bgClass} rounded-2xl shadow-lg p-6 mb-6`}>
            <button
              onClick={handleLogout}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition"
            >
              {t(localLanguage, "logoutButton")}
            </button>
          </div>

          {/* IT Support Info */}
          <div className={`bg-blue-50 border-[#003CFF] rounded-2xl shadow-lg p-6 border-l-4`}>
            <h2 className="text-xl font-bold text-[#003CFF] mb-4">📞 {t(localLanguage, "itSupport")}</h2>
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${textClass}`}>
              <div>
                <p className={`text-sm ${labelClass}`}>{t(localLanguage, "itHotline")}</p>
                <p className="font-medium text-lg">02-xxx-xxxx</p>
              </div>
              <div>
                <p className={`text-sm ${labelClass}`}>{t(localLanguage, "itEmail")}</p>
                <p className="font-medium">support@company.com</p>
              </div>
              <div>
                <p className={`text-sm ${labelClass}`}>{t(localLanguage, "workingHours")}</p>
                <p className="font-medium">Mon - Fri, 08:00 - 17:00</p>
              </div>
              <div>
                <p className={`text-sm ${labelClass}`}>{t(localLanguage, "serviceBranches")}</p>
                <p className="font-medium">Bangkok, Chiang Mai, Phuket</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

