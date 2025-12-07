import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setMessage("✓ เข้าสู่ระบบสำเร็จ!");
      setTimeout(() => navigate("/openticket"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "✗ เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <div
    className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center relative"
    style={{
      backgroundImage:
        "url('https://www.turbo.co.th/static/images/Contactus/Mobile/Contactus-Mobile.jpg')",
    }}
  >
    {/* Overlay มืดเพื่อให้องค์ประกอบด้านหน้าอ่านง่ายขึ้น */}
    <div className="absolute inset-0 bg-black/40"></div>

    <div className="w-full max-w-md relative z-10">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-lg">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">System Ticket</h1>
        <p className="text-blue-100 text-lg">ระบบจัดการติดตามงาน</p>
      </div>

      {/* Form Card */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden">
        {/* Form Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
          <h2 className="text-2xl font-bold text-white">เข้าสู่ระบบ</h2>
        </div>

        <div className="p-8">
          {/* Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-xl text-center font-medium text-sm animate-pulse ${
                message.includes("✓")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📧 อีเมล
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🔐 รหัสผ่าน
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition bg-gray-50"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  กำลังประมวลผล...
                </>
              ) : (
                "เข้าสู่ระบบ"
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-400 text-sm">หรือ</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              ยังไม่มีบัญชี?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-blue-600 font-semibold hover:text-blue-800 transition underline"
              >
                สมัครสมาชิกใหม่
              </button>
            </p>
          </div>
        </div>
      </div>

      <div className="text-center mt-8 text-blue-100 text-sm">
        <p>© 2025 System Ticket. All rights reserved.</p>
      </div>
    </div>
  </div>
);

}
