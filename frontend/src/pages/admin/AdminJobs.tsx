import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Added for description
import { Trash2, Plus, Briefcase, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

// Determine API URL based on environment or default to localhost
const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/jobs` 
  : "http://localhost:5000/api/jobs";

const AdminJobs = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-time",
    experience: "",
    skills: "", 
    description: ""
  });

  // Fetch Jobs on Mount
  const fetchJobs = async () => {
    try {
      const response = await axios.get(API_URL);
      setJobs(response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- STRICT VALIDATION LOGIC ---
  const validateForm = () => {
    const { title, company, location, experience, skills, description } = formData;
    
    if (title.trim().length < 3) return "Job Title must be at least 3 characters.";
    if (company.trim().length < 2) return "Company Name is too short.";
    if (location.trim().length < 2) return "Please enter a valid location.";
    if (experience.trim().length < 1) return "Experience field is required.";
    if (skills.trim().length < 2) return "Please provide at least one skill.";
    if (description.trim().length < 10) return "Description must be at least 10 characters long.";
    
    return null; // No errors
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Run Strict Validations
    const error = validateForm();
    if (error) {
      return toast({
        title: "Validation Error",
        description: error,
        variant: "destructive",
      });
    }

    setLoading(true);

    try {
      // 2. Format skills as an array before sending to backend
      const formattedData = {
        ...formData,
        skills: formData.skills.split(",").map(s => s.trim()).filter(s => s !== "")
      };

      await axios.post(API_URL, formattedData);
      
      toast({
        title: "Success",
        description: "Job posted successfully!",
      });
      
      // Reset form
      setFormData({
        title: "",
        company: "",
        location: "",
        type: "Full-time",
        experience: "",
        skills: "",
        description: ""
      });
      
      fetchJobs(); // Refresh list

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to post job.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Are you sure you want to delete this job?")) return;
    
    try {
      await axios.delete(`${API_URL}/${id}`);
      toast({ title: "Deleted", description: "Job removed." });
      fetchJobs();
    } catch (error) {
      toast({ title: "Error", description: "Could not delete job." });
    }
  };

  return (
    <AdminLayout title="Job Management">
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Add Job Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit sticky top-24">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
            <Plus className="w-5 h-5" /> Post New Job
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title*</Label>
              <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. React Developer" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company Name*</Label>
              <Input id="company" name="company" value={formData.company} onChange={handleChange} placeholder="e.g. Tech Corp" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location*</Label>
              <Input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Bangalore" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Job Type*</Label>
              <select 
                id="type"
                name="type" 
                value={formData.type} 
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Full-time">Full-time</option>
                <option value="Contract">Contract</option>
                <option value="Part-time">Part-time</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Experience Required*</Label>
              <Input id="experience" name="experience" value={formData.experience} onChange={handleChange} placeholder="e.g. 3-5 Years" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Skills (Comma separated)*</Label>
              <Input id="skills" name="skills" value={formData.skills} onChange={handleChange} placeholder="React, Node.js, AWS" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Job Description*</Label>
              <Textarea 
                id="description" 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                placeholder="Enter job responsibilities and requirements..."
                className="min-h-[100px]"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 font-bold py-6">
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2" />}
              {loading ? "Posting..." : "Publish Job"}
            </Button>
          </form>
        </div>

        {/* Right Column: Jobs List */}
        <div className="lg:col-span-2 space-y-4">
           <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
            <Briefcase className="w-5 h-5" /> Active Jobs ({jobs.length})
          </h3>

          {jobs.length === 0 ? (
            <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
              <div className="bg-gray-50 p-4 rounded-full mb-4">
                <Briefcase className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">No active jobs found.</p>
              <p className="text-sm text-gray-400">Use the form to post your first recruitment opening.</p>
            </div>
          ) : (
            jobs.map((job: any) => (
              <div key={job._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start hover:shadow-md transition-shadow group">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xl text-gray-900">{job.title}</h4>
                    <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-green-100">Live</span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium flex items-center gap-2">
                    <span className="text-blue-600 font-bold">{job.company}</span> • {job.location} • <span className="text-gray-400">{job.type}</span>
                  </p>
                  
                  {/* Job Description Preview */}
                  {job.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 max-w-xl">
                      {job.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Briefcase size={12}/> {job.experience}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {Array.isArray(job.skills) ? job.skills.map((skill: string, i: number) => (
                      <span key={i} className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-semibold border border-slate-200">
                        {skill}
                      </span>
                    )) : null}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(job._id)} 
                  className="text-gray-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

// Simple Loader component for the button
const Loader2 = ({ className }: { className?: string }) => (
  <svg className={`animate-spin h-5 w-5 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default AdminJobs;