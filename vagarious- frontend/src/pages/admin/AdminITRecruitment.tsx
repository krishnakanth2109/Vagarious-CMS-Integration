import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Trash2, 
  Plus, 
  Save, 
  Loader2, 
  RefreshCw, 
  AlertCircle,
  Layers,
  Briefcase,
  Factory,
  GitMerge
} from "lucide-react";

// --- DYNAMIC URL CONFIGURATION ---
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_URL = `${BASE_URL}/it-recruitment`;

// --- INTERFACES ---
interface Technology {
  category: string;
  items: string[];
}

interface Role {
  title: string;
  description: string;
  skills: string[];
  icon: string;
}

interface Industry {
  name: string;
  count: string;
  icon: string;
}

interface ProcessStep {
  step: string;
  title: string;
  description: string;
}

interface PageData {
  technologies: Technology[];
  roles: Role[];
  industries: Industry[];
  process: ProcessStep[];
}

const AdminITRecruitment = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Initial state structure
  const [data, setData] = useState<PageData>({
    technologies: [],
    roles: [],
    industries: [],
    process: []
  });

  // Fetch Data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      // Ensure arrays exist even if DB returns null for some sections
      setData({
        technologies: res.data.technologies || [],
        roles: res.data.roles || [],
        industries: res.data.industries || [],
        process: res.data.process || []
      });
      toast.success("Content loaded successfully");
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Failed to load data. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- STRICT VALIDATION LOGIC ---
  const validateForm = (): string | null => {
    // 1. Validate Technologies
    if (data.technologies.length === 0) return "At least one Technology category is required.";
    for (const [i, tech] of data.technologies.entries()) {
      if (!tech.category.trim()) return `Technology #${i + 1}: Category name is missing.`;
      if (tech.items.length === 0 || tech.items.some(x => !x.trim())) return `Technology #${i + 1}: Items list cannot be empty.`;
    }

    // 2. Validate Roles
    if (data.roles.length === 0) return "At least one Job Role is required.";
    for (const [i, role] of data.roles.entries()) {
      if (!role.title.trim()) return `Role #${i + 1}: Title is missing.`;
      if (!role.description.trim()) return `Role #${i + 1}: Description is missing.`;
      if (!role.icon.trim()) return `Role #${i + 1}: Icon name is missing.`;
      if (role.skills.length === 0) return `Role #${i + 1}: At least one skill is required.`;
    }

    // 3. Validate Industries
    if (data.industries.length === 0) return "At least one Industry is required.";
    for (const [i, ind] of data.industries.entries()) {
      if (!ind.name.trim()) return `Industry #${i + 1}: Name is missing.`;
      if (!ind.count.trim()) return `Industry #${i + 1}: Count/Stat is missing.`;
    }

    // 4. Validate Process
    if (data.process.length === 0) return "Process steps are required.";
    for (const [i, proc] of data.process.entries()) {
      if (!proc.step.trim()) return `Process #${i + 1}: Step number is missing.`;
      if (!proc.title.trim()) return `Process #${i + 1}: Title is missing.`;
      if (!proc.description.trim()) return `Process #${i + 1}: Description is missing.`;
    }

    return null; // No errors
  };

  // Handle Save
  const handleSave = async () => {
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    setSaving(true);
    try {
      await axios.put(API_URL, data);
      toast.success("Page content updated successfully!");
    } catch (error: any) {
      console.error("Save Error:", error);
      const msg = error.response?.data?.message || "Failed to update content";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // --- STATE UPDATERS ---

  // Update simple string fields
  const updateItem = (section: keyof PageData, index: number, field: string, value: string) => {
    const updatedSection = [...data[section]] as any[];
    updatedSection[index] = { ...updatedSection[index], [field]: value };
    setData({ ...data, [section]: updatedSection });
  };

  // Update Array fields (comma separated string -> Array)
  const updateArrayField = (section: keyof PageData, index: number, field: string, valueString: string) => {
    const updatedSection = [...data[section]] as any[];
    // Split by comma, trim whitespace, remove empty strings
    const arrayData = valueString.split(",").map(s => s.trim()).filter(s => s !== "");
    updatedSection[index] = { ...updatedSection[index], [field]: arrayData };
    setData({ ...data, [section]: updatedSection });
  };

  // Add new item template
  const addItem = (section: keyof PageData) => {
    const templates: any = {
      technologies: { category: "", items: [] },
      roles: { title: "", description: "", skills: [], icon: "Code" },
      industries: { name: "", count: "0+", icon: "Building" },
      process: { step: "01", title: "", description: "" }
    };
    setData({ ...data, [section]: [...data[section], templates[section]] });
  };

  // Remove item
  const removeItem = (section: keyof PageData, index: number) => {
    const updatedSection = data[section].filter((_, i) => i !== index);
    setData({ ...data, [section]: updatedSection });
  };

  if (loading) {
    return (
      <AdminLayout title="IT Recruitment">
        <div className="flex h-[50vh] items-center justify-center flex-col gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading content configuration...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Manage IT Recruitment Page">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Page Content</h2>
          <p className="text-sm text-muted-foreground">Manage the content displayed on the public IT Recruitment page.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
           <Button variant="outline" onClick={fetchData} size="icon" title="Reload Data">
             <RefreshCw className="w-4 h-4" />
           </Button>
           <Button onClick={handleSave} disabled={saving} className="gap-2 w-full sm:w-auto bg-green-600 hover:bg-green-700">
             {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
             Save Changes
           </Button>
        </div>
      </div>

      <Tabs defaultValue="technologies" className="space-y-6">
        <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-lg overflow-x-auto">
          <TabsTrigger value="technologies" className="gap-2 px-4 py-2"><Layers className="w-4 h-4"/> Technologies</TabsTrigger>
          <TabsTrigger value="roles" className="gap-2 px-4 py-2"><Briefcase className="w-4 h-4"/> Job Roles</TabsTrigger>
          <TabsTrigger value="industries" className="gap-2 px-4 py-2"><Factory className="w-4 h-4"/> Industries</TabsTrigger>
          <TabsTrigger value="process" className="gap-2 px-4 py-2"><GitMerge className="w-4 h-4"/> Process</TabsTrigger>
        </TabsList>

        {/* --- TECHNOLOGIES TAB --- */}
        <TabsContent value="technologies">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b bg-gray-50/50">
              <div>
                <CardTitle>Technology Stacks</CardTitle>
                <CardDescription>Categorize tech stacks (e.g., Frontend: React, Vue).</CardDescription>
              </div>
              <Button size="sm" onClick={() => addItem('technologies')} variant="secondary">
                <Plus className="w-4 h-4 mr-2" /> Add Category
              </Button>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {data.technologies.length === 0 && <div className="text-center text-gray-400 py-8">No technologies added yet.</div>}
              {data.technologies.map((tech, index) => (
                <div key={index} className="flex gap-4 p-4 border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow relative group">
                  <div className="flex-1 grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-500">Category Name</Label>
                      <Input 
                        placeholder="e.g. Frontend" 
                        value={tech.category} 
                        onChange={(e) => updateItem('technologies', index, 'category', e.target.value)} 
                        className={!tech.category ? "border-red-300" : ""}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-xs font-semibold text-gray-500">Tech Items (Comma separated)</Label>
                      <Input 
                        placeholder="e.g. React, Angular, Vue.js" 
                        value={tech.items.join(", ")} 
                        onChange={(e) => updateArrayField('technologies', index, 'items', e.target.value)}
                        className={tech.items.length === 0 ? "border-red-300" : ""}
                      />
                      {/* Visual Preview of array */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {tech.items.map((t, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-gray-400 hover:text-red-500 self-start mt-6"
                    onClick={() => removeItem('technologies', index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- ROLES TAB --- */}
        <TabsContent value="roles">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b bg-gray-50/50">
              <div>
                <CardTitle>Job Roles</CardTitle>
                <CardDescription>Define the roles you specialize in recruiting.</CardDescription>
              </div>
              <Button size="sm" onClick={() => addItem('roles')} variant="secondary">
                <Plus className="w-4 h-4 mr-2" /> Add Role
              </Button>
            </CardHeader>
            <CardContent className="grid lg:grid-cols-2 gap-6 pt-6">
              {data.roles.length === 0 && <div className="col-span-2 text-center text-gray-400 py-8">No roles added yet.</div>}
              {data.roles.map((role, index) => (
                <div key={index} className="border p-5 rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow relative">
                  <div className="absolute top-3 right-3">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500" onClick={() => removeItem('roles', index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 pr-8">
                       <div className="space-y-1.5">
                          <Label className="text-xs">Role Title</Label>
                          <Input value={role.title} onChange={(e) => updateItem('roles', index, 'title', e.target.value)} placeholder="e.g. Backend Dev" />
                       </div>
                       <div className="space-y-1.5">
                          <Label className="text-xs">Icon (Lucide Name)</Label>
                          <Input value={role.icon} onChange={(e) => updateItem('roles', index, 'icon', e.target.value)} placeholder="e.g. Database" />
                       </div>
                    </div>
                    
                    <div className="space-y-1.5">
                       <Label className="text-xs">Description</Label>
                       <Textarea 
                          value={role.description} 
                          onChange={(e) => updateItem('roles', index, 'description', e.target.value)} 
                          className="h-20 resize-none"
                          placeholder="Brief description of the role..."
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs">Skills (Comma separated)</Label>
                        <Input 
                            value={role.skills.join(", ")} 
                            onChange={(e) => updateArrayField('roles', index, 'skills', e.target.value)} 
                            placeholder="e.g. Node.js, Python, SQL"
                        />
                         <div className="flex flex-wrap gap-1 mt-1 min-h-[20px]">
                            {role.skills.map((s, i) => (
                              <span key={i} className="text-[10px] px-2 py-0.5 bg-green-50 text-green-700 rounded-md border border-green-100">
                                {s}
                              </span>
                            ))}
                        </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- INDUSTRIES TAB --- */}
        <TabsContent value="industries">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b bg-gray-50/50">
                <CardTitle>Industries & Stats</CardTitle>
                <Button size="sm" onClick={() => addItem('industries')} variant="secondary"><Plus className="w-4 h-4 mr-2" /> Add Industry</Button>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
                {data.industries.map((ind, index) => (
                <div key={index} className="flex gap-2 border p-4 rounded-lg bg-card items-start">
                    <div className="flex-1 space-y-3">
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Industry Name</Label>
                            <Input value={ind.name} onChange={(e) => updateItem('industries', index, 'name', e.target.value)} placeholder="Fintech" />
                        </div>
                        <div className="flex gap-2">
                             <div className="space-y-1 flex-1">
                                <Label className="text-xs text-muted-foreground">Count</Label>
                                <Input value={ind.count} onChange={(e) => updateItem('industries', index, 'count', e.target.value)} placeholder="150+" />
                             </div>
                             <div className="space-y-1 flex-1">
                                <Label className="text-xs text-muted-foreground">Icon</Label>
                                <Input value={ind.icon} onChange={(e) => updateItem('industries', index, 'icon', e.target.value)} placeholder="Globe" />
                             </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500 h-6 w-6" onClick={() => removeItem('industries', index)}><Trash2 className="w-4 h-4" /></Button>
                </div>
                ))}
            </CardContent>
            </Card>
        </TabsContent>

        {/* --- PROCESS TAB --- */}
        <TabsContent value="process">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b bg-gray-50/50">
                <CardTitle>Recruitment Process</CardTitle>
                <Button size="sm" onClick={() => addItem('process')} variant="secondary"><Plus className="w-4 h-4 mr-2" /> Add Step</Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                {data.process.map((step, index) => (
                <div key={index} className="flex gap-4 border p-4 rounded-lg bg-card items-start">
                    <div className="w-20 space-y-1">
                        <Label className="text-xs">Step #</Label>
                        <Input value={step.step} onChange={(e) => updateItem('process', index, 'step', e.target.value)} placeholder="01" className="text-center font-bold" />
                    </div>
                    <div className="flex-1 space-y-3">
                        <div className="space-y-1">
                             <Label className="text-xs">Title</Label>
                             <Input value={step.title} onChange={(e) => updateItem('process', index, 'title', e.target.value)} placeholder="Sourcing" />
                        </div>
                        <div className="space-y-1">
                             <Label className="text-xs">Description</Label>
                             <Textarea value={step.description} onChange={(e) => updateItem('process', index, 'description', e.target.value)} placeholder="Description of this step..." className="min-h-[60px]" />
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500 mt-6" onClick={() => removeItem('process', index)}><Trash2 className="w-4 h-4" /></Button>
                </div>
                ))}
            </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminITRecruitment;