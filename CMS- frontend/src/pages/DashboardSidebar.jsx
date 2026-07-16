import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, Users, Briefcase, Calendar, MessageSquare,
  BarChart2, Settings, LogOut, ChevronLeft, ChevronRight,
  User, ClipboardList, Building2, FileText, UserCheck,
  Menu, X, BrainCircuit, QrCode, Lock
} from 'lucide-react';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/candidates', label: 'Candidates', icon: Users },
  { to: '/admin/recruiters', label: 'Recruiters', icon: UserCheck },
  { to: '/admin/clients', label: 'Clients', icon: Building2 },
  { to: '/admin/invoices', label: 'Invoices', icon: FileText },
  { to: '/admin/requirements', label: 'Requirements', icon: ClipboardList },
  { to: '/admin/visitors-qr', label: 'Visitors QR', icon: QrCode },
  { to: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { to: '/admin/mock', label: 'AI Mock', icon: BrainCircuit },
  { to: '/admin/reports', label: 'Reports', icon: BarChart2 },
];


const recruiterLinks = [
  { to: '/recruiter', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/recruiter/candidates', label: 'My Candidates', icon: Users },
  { to: '/recruiter/assignments', label: 'Assignments', icon: Briefcase },
  { to: '/recruiter/schedules', label: 'Schedules', icon: Calendar },
  { to: '/recruiter/messages', label: 'Messages', icon: MessageSquare },
  { to: '/recruiter/mock', label: 'AI Mock', icon: BrainCircuit },
  { to: '/recruiter/reports', label: 'Reports', icon: BarChart2 },
  { to: '/recruiter/profile', label: 'Profile', icon: User },
];

export function DashboardSidebar({ collapsed, onToggle, mobileOpen, setMobileOpen }) {
  const { user, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);

  // Close mobile sidebar and settings dropdown on route change
  React.useEffect(() => {
    if (setMobileOpen) {
      setMobileOpen(false);
    }
    setShowSettingsDropdown(false);
  }, [location.pathname, setMobileOpen]);

  const links = (userRole === 'admin' || userRole === 'manager') ? adminLinks : recruiterLinks;
  const profilePath = userRole === 'recruiter' ? '/recruiter/profile' : '/admin/profile';
  const passwordPath = userRole === 'recruiter' ? '/recruiter/change-password' : '/admin/change-password';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full relative">
      {/* Logo / Header */}
      <div className={`flex items-center justify-between px-4 py-5 border-b border-gray-200 dark:border-gray-700 ${collapsed && !isMobile ? 'justify-center' : ''}`}>
        {(!collapsed || isMobile) && (
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400 truncate">
            {(userRole === 'admin' || userRole === 'manager') ? 'Admin Panel' : 'Recruiter CMS'}
          </span>
        )}

        {!isMobile && (
          <button
            onClick={onToggle}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          >
            {collapsed ? <ChevronRight className="h-5 w-5"/> : <ChevronLeft className="h-5 w-5"/>}
          </button>
        )}
        {isMobile && (
          <button onClick={() => setMobileOpen(false)} className="p-1 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="h-5 w-5"/>
          </button>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => isMobile && setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              } ${collapsed && !isMobile ? 'justify-center' : ''}`
            }
          >
            <Icon className="h-5 w-5 flex-shrink-0"/>
            {(!collapsed || isMobile) && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Settings Drop-up Dropdown */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 relative">
        {showSettingsDropdown && (
          <div className={`absolute bottom-[72px] z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 ${
            collapsed && !isMobile ? 'left-2 w-48' : 'left-4 right-4'
          }`}>
            <NavLink
              to={profilePath}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 font-bold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`
              }
              onClick={() => setShowSettingsDropdown(false)}
            >
              <User className="h-4 w-4 text-blue-500" />
              <span>Profile</span>
            </NavLink>
            <NavLink
              to={passwordPath}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 font-bold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`
              }
              onClick={() => setShowSettingsDropdown(false)}
            >
              <Lock className="h-4 w-4 text-amber-500" />
              <span>Password</span>
            </NavLink>
            <hr className="border-gray-100 dark:border-gray-700 my-1" />
            <button
              onClick={() => {
                setShowSettingsDropdown(false);
                handleLogout();
              }}
              className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        <button
          onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
          className={`flex items-center gap-3 w-full px-3 py-3 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
            collapsed && !isMobile ? 'justify-center' : ''
          }`}
        >
          <Settings className="h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-400"/>
          {(!collapsed || isMobile) && <span className="font-semibold text-gray-700 dark:text-gray-300">Settings</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-300 animate-in fade-in" 
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile slide-in sidebar drawer */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 h-full shadow-2xl md:hidden transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent isMobile/>
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex-shrink-0 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <SidebarContent/>
      </aside>
    </>
  );
}

export default DashboardSidebar;
