import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/AdminLayout";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  Building2, 
  AlertCircle,
  Search,
  Trash2
} from "lucide-react";
import { format, isValid } from "date-fns";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_URL = `${BASE_URL}/employer-requirements`;

interface Requirement {
  _id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  positions: string;
  location: string;
  requirements: string;
  status: "Pending" | "Contacted" | "Closed";
  createdAt: string;
}

const AdminEmployerRequirements = () => {
  const [data, setData] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchRequirements = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setData(response.data);
    } catch (err) {
      toast.error("Failed to load requirements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  // --- DELETE HANDLER ---
  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this requirement permanently?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setData(prev => prev.filter(item => item._id !== id));
      toast.success("Requirement deleted");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  // --- STATUS UPDATE ---
  const updateStatus = async (id: string, currentStatus: string) => {
    let newStatus = "Pending";
    if (currentStatus === "Pending") newStatus = "Contacted";
    else if (currentStatus === "Contacted") newStatus = "Closed";
    
    setUpdatingId(id);
    try {
      await axios.put(`${API_URL}/${id}`, { status: newStatus });
      setData(prev => prev.map(item => item._id === id ? { ...item, status: newStatus as any } : item));
      toast.success(`Marked as ${newStatus}`);
    } catch (error) {
      toast.error("Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  // --- SEARCH FILTER ---
  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "Contacted": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Closed": return "bg-slate-100 text-slate-600 border-slate-200";
      default: return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  return (
    <AdminLayout title="Employer Requirements">
      <div className="space-y-6">
        
        {/* Top Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search company or email..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={fetchRequirements} disabled={loading}>
            {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
            Refresh List
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead>Company & Contact</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Location/Positions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-blue-500" /></TableCell></TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20 text-gray-400">No requirements found.</TableCell></TableRow>
              ) : (
                filteredData.map((item) => (
                  <TableRow key={item._id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{item.companyName}</span>
                        <span className="text-xs text-gray-500">{item.contactPerson}</span>
                        <div className="flex items-center gap-2 mt-1">
                           <a href={`mailto:${item.email}`} className="text-blue-500 hover:underline text-xs"><Mail className="inline w-3 h-3 mr-1" />Email</a>
                           <span className="text-xs text-gray-400"><Phone className="inline w-3 h-3 mr-1" />{item.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[250px] text-xs text-gray-600 bg-gray-50 p-2 rounded border italic">
                        "{item.requirements}"
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs gap-1">
                        <span className="flex items-center font-medium"><MapPin className="w-3 h-3 mr-1 text-red-500" />{item.location}</span>
                        <span className="flex items-center text-gray-500"><Briefcase className="w-3 h-3 mr-1" />{item.positions}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={`cursor-pointer px-3 py-1 uppercase text-[10px] tracking-wider ${getBadgeVariant(item.status)}`}
                        onClick={() => !updatingId && updateStatus(item._id, item.status)}
                      >
                        {updatingId === item._id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(item._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminEmployerRequirements;