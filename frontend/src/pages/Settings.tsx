import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Save, Lock, ShieldCheck, Loader2, Eye, EyeOff } from "lucide-react";

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  
  const [adminEmail, setAdminEmail] = useState("career.arahinfotech@gmail.com");
  
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load Admin Email on Component Mount
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user") || sessionStorage.getItem("adminUser");
    
    const CORRECT_ADMIN_EMAIL = "career.arahinfotech@gmail.com";

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const email = parsed.email || parsed.user?.email || CORRECT_ADMIN_EMAIL;
        setAdminEmail(email);
      } catch (e) {
        console.error("Error parsing user session", e);
        setAdminEmail(CORRECT_ADMIN_EMAIL);
      }
    } else {
      console.warn("No user found in session storage, using default");
      setAdminEmail(CORRECT_ADMIN_EMAIL); 
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error("New passwords do not match");
    }
    if (formData.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    setLoading(true);
    
    // FIXED: .env already has /api suffix, so don't add it again
    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const fullUrl = `${BASE_URL}/auth/change-password`;

    console.log("Submitting to:", fullUrl);
    console.log("Payload:", {
      email: adminEmail,
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword
    });

    try {
      const response = await axios.put(fullUrl, {
        email: adminEmail,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      console.log("Success:", response.data);
      toast.success(response.data.message || "Password changed successfully");
      
      // Clear form
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error("Error details:", error);
      const msg = error.response?.data?.message || "Failed to update password. Check console.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Security Settings">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="p-8 bg-slate-50 border-b border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Change Password</h3>
              <p className="text-sm text-gray-500">
                Account: <span className="font-semibold text-gray-700">{adminEmail}</span>
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-4">
              
              {/* Current Password */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Current Password</label>
                <div className="relative">
                  <input
                    name="currentPassword"
                    type={showPass ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="Enter current password"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <hr className="my-6 border-gray-100" />

              {/* New Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">New Password</label>
                  <input
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="Min 6 chars"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
                  <input
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="Repeat new password"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-200 disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default Settings;