import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "sonner";
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Bell,
  Briefcase,
  FileText,
  Users,
  ChevronLeft,
  Menu,
  MessageSquare // Imported Icon for Contacts
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AdminLayout = ({ children, title = "Dashboard" }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false); // Sidebar State
  const appName = import.meta.env.VITE_APP_NAME || "VGS Admin";

  // Check Authentication on Mount
  useEffect(() => {
    const isAuth = sessionStorage.getItem("isAuthenticated");
    if (!isAuth) {
      toast.error("Please login first");
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("isAuthenticated");
    toast.info("Logged out successfully");
    navigate("/login");
  };

  // --- FILTERED MENU ITEMS ---
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Jobs", path: "/admin-jobs", icon: Briefcase },
    { name: "Candidate Applications", path: "/admin-candidates", icon: FileText }, 
    { name: "Employee Requirement", path: "/admin-requirements", icon: Users },
    { name: "Contact Messages", path: "/admin-contacts", icon: MessageSquare }, // ADDED THIS LINE
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      
      {/* SIDEBAR */}
      <aside 
        className={`bg-[#0f172a] text-white hidden md:flex flex-col shadow-2xl z-20 fixed h-full transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-72"
        }`}
      >
        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-24 bg-blue-600 text-white p-1 rounded-full border-2 border-white hover:bg-blue-700 transition-colors z-30"
        >
          {isCollapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className={`p-8 pb-4 transition-all duration-300 ${isCollapsed ? "items-center px-4" : ""}`}>
            <h1 className={`font-extrabold tracking-tight text-white transition-all ${isCollapsed ? "text-xl" : "text-xl"}`}>
              {isCollapsed ? appName.charAt(0) : appName}
            </h1>
            {!isCollapsed && (
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold animate-in fade-in">
                Management
              </p>
            )}
        </div>
        
        <nav className="flex-1 px-3 space-y-2 mt-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                title={isCollapsed ? item.name : ""}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                } ${isCollapsed ? "justify-center px-2" : ""}`}
              >
                {isActive && !isCollapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                )}
                <Icon size={22} className={`shrink-0 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                
                {!isCollapsed && (
                  <span className="font-medium tracking-wide animate-in slide-in-from-left-2">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-[#0f172a]">
            <button 
              onClick={handleLogout} 
              className={`flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all ${isCollapsed ? "px-0" : "px-4"}`}
            >
                <LogOut size={18} /> 
                {!isCollapsed && <span>Sign Out</span>}
            </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          isCollapsed ? "md:ml-20" : "md:ml-72"
        }`}
      >
        {/* HEADER */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{title}</h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 relative text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
              A
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
            <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                {children}
            </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;