import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import clsx from 'clsx';
import { BookOpen, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { userRole } = useAuth();
  const guidePath = userRole === 'recruiter' ? '/recruiter/user-guide' : '/admin/user-guide';

  return (
    <div className="min-h-[125vh] bg-[#f3f6fd] flex flex-col md:flex-row font-sans">

      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Mobile Top Navigation Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 h-16 flex items-center justify-between px-4 md:hidden shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#283086] rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold text-sm">V</span>
            </div>
            <span className="text-slate-900 font-bold text-lg tracking-tight ">VTS Tracker</span>
          </div>
        </div>
        
        {/* User Guide link on mobile header */}
        <Link
          to={guidePath}
          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-white px-3 py-1.5 text-xs font-semibold text-[#283086] shadow-sm transition hover:border-[#283086] hover:bg-blue-50 focus:outline-none"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Guide
        </Link>
      </header>

      <div
        className={clsx(
          "flex-1 min-h-[125vh] flex flex-col",
          "transition-all duration-300 ease-in-out",
          "ml-0",
          isSidebarOpen ? "md:ml-80" : "md:ml-20"
        )}
      >
        {/* ✅ FIX: Removed key={location.pathname} and keyframe animation 
            React Router handles smooth DOM diffing. Forcing a re-render 
            with a key is what caused the entire page to "blink" and flash. */}
        <main className="flex-1 w-full p-4 md:p-8 overflow-x-hidden overflow-y-auto bg-[#f3f6fd]">
          <div className="mb-4 hidden md:flex justify-end">
            <Link
              to={guidePath}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-[#283086] shadow-sm transition hover:border-[#283086] hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <BookOpen className="h-4 w-4" />
              User Guide
            </Link>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
