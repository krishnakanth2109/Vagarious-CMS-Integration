import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface DashboardHeaderProps {
  title: string;
}

const DashboardHeader = ({ title }: DashboardHeaderProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    toast.info("Logged out successfully");
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between p-6 bg-white shadow-sm border-b">
      <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
      <button
        onClick={handleLogout}
        className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors"
      >
        Logout
      </button>
    </header>
  );
};

export default DashboardHeader;