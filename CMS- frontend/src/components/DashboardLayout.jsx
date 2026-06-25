import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import clsx from 'clsx';
import { BookOpen } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { userRole } = useAuth();
  const guidePath = userRole === 'recruiter' ? '/recruiter/user-guide' : '/admin/user-guide';

  return (
    <div className="min-h-[125vh] bg-[#f3f6fd] flex font-sans">

      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div
        className={clsx(
          "flex-1 min-h-[125vh] flex flex-col",
          "transition-all duration-300 ease-in-out",
          isSidebarOpen ? "ml-80" : "ml-20"
        )}
      >
        {/* ✅ FIX: Removed key={location.pathname} and keyframe animation 
            React Router handles smooth DOM diffing. Forcing a re-render 
            with a key is what caused the entire page to "blink" and flash. */}
        <main className="flex-1 w-full p-4 md:p-8 overflow-x-hidden overflow-y-auto bg-[#f3f6fd]">
          <div className="mb-4 flex justify-end">
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
