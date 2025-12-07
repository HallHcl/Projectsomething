import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function UserNav() {
  const loc = useLocation();
  const active = (path) => (loc.pathname === path ? "text-white bg-blue-600" : "text-gray-700 hover:text-blue-600");

  const bgClass = "bg-white border-gray-200";
  const textClass = "text-gray-600";

  return (
    <nav className={`${bgClass} shadow border-b transition-colors`}>
      <div className="max-w-full px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="text-xl font-bold text-[#003CFF]">System Ticket</Link>
            <div className="flex items-center gap-2">
              <Link to="/dashboard" className={`px-3 py-2 rounded ${active('/dashboard')}`}>
                Home
              </Link>
              <Link to="/openticket" className={`px-3 py-2 rounded ${active('/openticket')}`}>
                Open Ticket
              </Link>
              <Link to="/ticketHistory" className={`px-3 py-2 rounded ${active('/ticketHistory')}`}>
                My Tickets
              </Link>
              <Link to="/knowledge" className={`px-3 py-2 rounded ${active('/knowledge')}`}>
                Knowledge Base
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/profile" className={`${textClass} hover:text-gray-800`}>Profile</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
