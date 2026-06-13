import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout"; // Ensure this path is correct
import axios from "axios";
import { toast } from "sonner";
import { Loader2, Trash2, Plus, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RoleData {
  _id?: string;
  title: string;
  description: string;
  positions: string;
  icon: string;
  color: string;
  image: string;
}

const AdminNonITRoles = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<RoleData>({
    title: "",
    description: "",
    positions: "",
    icon: "Briefcase",
    color: "from-blue-500 to-cyan-500",
    image: "",
  });

  const fetchRoles = async () => {
    try {
      const res = await axios.get(`${API_URL}/non-it-roles`);
      setRoles(res.data);
    } catch (error) {
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const positionsArray = formData.positions.split(",").map((p) => p.trim());

      await axios.post(`${API_URL}/non-it-roles`, {
        ...formData,
        positions: positionsArray,
      });

      toast.success("Role added successfully");
      setFormData({
        title: "",
        description: "",
        positions: "",
        icon: "Briefcase",
        color: "from-blue-500 to-cyan-500",
        image: "",
      });
      fetchRoles();
    } catch (error) {
      toast.error("Failed to add role");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    try {
      await axios.delete(`${API_URL}/non-it-roles/${id}`);
      toast.success("Role deleted");
      fetchRoles();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <AdminLayout title="Non-IT Recruitment Roles">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* FORM SECTION */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Role Category</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Role Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Sales & Marketing"
                  required
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short description of the department..."
                  required
                />
              </div>

              <div>
                <Label>Positions (Comma separated)</Label>
                <Input
                  value={formData.positions}
                  onChange={(e) => setFormData({ ...formData, positions: e.target.value })}
                  placeholder="e.g. Sales Executive, Brand Manager, SEO Specialist"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    Icon Name <Info size={12} title="Use Lucide React Icon names like 'Users', 'BarChart3'" />
                  </Label>
                  <Input
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="e.g. BarChart3"
                    required
                  />
                </div>
                <div>
                  <Label>Gradient Class (Tailwind)</Label>
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="from-blue-500 to-cyan-500"
                  />
                </div>
              </div>

               <div>
                <Label>Image URL (Optional)</Label>
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2 h-4 w-4" />}
                {submitting ? "Saving..." : "Add Role"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* LIST SECTION */}
        <Card>
          <CardHeader>
            <CardTitle>Existing Roles ({roles.length})</CardTitle>
          </CardHeader>
          <CardContent className="h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
            ) : (
              <div className="space-y-4">
                {roles.length === 0 && <p className="text-muted-foreground text-center py-4">No roles added yet.</p>}
                
                {roles.map((role) => (
                  <div key={role._id} className="flex flex-col sm:flex-row items-start justify-between p-4 border rounded-xl hover:bg-slate-50 transition-colors gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                         <h4 className="font-bold text-gray-900">{role.title}</h4>
                         <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono border">
                            {role.icon}
                         </span>
                      </div>
                      
                      <p className="text-sm text-gray-500 line-clamp-2 mb-2">{role.description}</p>
                      
                      <div className="flex flex-wrap gap-1.5">
                        {role.positions.map((p: string, i: number) => (
                          <span key={i} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium border border-blue-100">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(role._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminNonITRoles;