import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardSidebar } from './DashboardSidebar';
import { Toaster } from '../hooks/use-toast';
import { Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { userRole } = useAuth();

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-950">
      
      {/* Mobile Top Navigation Header */}
      <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-16 flex items-center justify-between px-4 md:hidden shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors focus:outline-none"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold text-sm">V</span>
            </div>
            <span className="text-slate-900 dark:text-white font-bold text-lg tracking-tight">
              {(userRole === 'admin' || userRole === 'manager') ? 'Admin Panel' : 'Recruiter CMS'}
            </span>
          </div>
        </div>
      </header>

      <DashboardSidebar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed(!collapsed)} 
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      
      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
