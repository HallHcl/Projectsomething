import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

export default function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    employeeId: "",
    branchCode: "",
    branchName: "",
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/register`, formData);
      setMessage("✓ สมัครสมาชิกสำเร็จ! กำลังไปหน้า Login...");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "✗ สมัครสมาชิกไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-green-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-lg">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">System Ticket</h1>
          <p className="text-green-100 text-lg">สมัครสมาชิกใหม่</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">สมัครสมาชิก</h2>
          </div>

          <div className="p-8">
            {/* Message */}
            {message && (
              <div className={`mb-6 p-4 rounded-xl text-center font-medium text-sm animate-pulse ${
                message.includes("✓")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}>
                {message}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📧 อีเมล
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition bg-gray-50"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🔐 รหัสผ่าน
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition bg-gray-50"
                />
              </div>

              {/* Employee ID */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  👤 รหัสพนักงาน
                </label>
                <input
                  type="text"
                  name="employeeId"
                  placeholder="EMP001"
                  value={formData.employeeId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition bg-gray-50"
                />
              </div>

              {/* Branch Code */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🏢 รหัสสาขา
                </label>
                <input
                  type="text"
                  name="branchCode"
                  placeholder="BRA001"
                  value={formData.branchCode}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition bg-gray-50"
                />
              </div>

              {/* Branch Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🏛️ ชื่อสาขา
                </label>
                <input
                  type="text"
                  name="branchName"
                  placeholder="สาขากรุงเทพ"
                  value={formData.branchName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition bg-gray-50"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg mt-6"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    กำลังสมัครสมาชิก...
                  </>
                ) : (
                  "สมัครสมาชิก"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-8 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-gray-400 text-sm">หรือ</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                มีบัญชีอยู่แล้ว?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="text-green-600 font-semibold hover:text-green-800 transition underline"
                >
                  เข้าสู่ระบบ
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-green-100 text-sm">
          <p>© 2025 System Ticket. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
