import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowRight, Search, MapPin, Briefcase, Clock, Upload,
  CheckCircle2, FileText, Users, TrendingUp, Award, Loader2,
  Calendar, Layers, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/layout/Layout";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import heroCandidates from "@/assets/hero-candidates.jpg";
import axios from "axios";
import { useRef } from "react";
// --- TYPES ---
interface FormErrors {
  [key: string]: string;
}

// ---------------------------------------------------------
// API CONFIGURATION
// ---------------------------------------------------------
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const applicationProcess = [
  { icon: FileText, title: "Submit Resume", description: "Upload your updated resume through our portal or send via email." },
  { icon: Users, title: "Initial Screening", description: "Our recruiters review your profile and assess fit for available positions." },
  { icon: Search, title: "Job Matching", description: "We match your skills and preferences with suitable job opportunities." },
  { icon: TrendingUp, title: "Interview Prep", description: "Receive guidance and tips to ace your interviews." },
  { icon: Award, title: "Get Hired", description: "Clear interviews and land your dream job with our support." },
];

const faqs = [
  { question: "Is there any fee for candidates?", answer: "No, our services are completely free for job seekers." },
  { question: "How long does the placement process take?", answer: "Typically 2-4 weeks from profile submission to offer." },
  { question: "Will my resume be shared without my consent?", answer: "No. We seek consent before sharing your profile." },
  { question: "What types of jobs do you offer?", answer: "Opportunities across IT and Non-IT sectors." },
];

const benefits = [
  "Access to premium job opportunities", "Personalized job recommendations",
  "Interview preparation support", "Salary negotiation guidance",
  "Career counseling", "100% confidential process",
];

const Candidates = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsFailed, setJobsFailed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
    currentCompany: "",
    currentRole: "",
    appliedJob: "", 
    skills: "",
    preferredLocation: "",
    noticePeriod: "",
    message: "",
  });

  // Fetch Jobs from Backend (public endpoint — no auth required)
  useEffect(() => {
    const fetchJobs = async () => {
      // 8-second timeout so Render cold-start doesn't hang the page
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      try {
        const response = await axios.get(`${API_URL}/jobs/public`, {
          signal: controller.signal,
        });
        setJobs(response.data);
        setJobsFailed(false);
      } catch (error: any) {
        // Don't treat abort as a visible error — just silently show General Application
        if (error?.name !== "CanceledError" && error?.name !== "AbortError") {
          console.error("Failed to fetch jobs:", error);
        }
        setJobsFailed(true);
      } finally {
        clearTimeout(timer);
        setJobsLoading(false);
      }
    };
    fetchJobs();
  }, []);


  // --- Strict Validation Rules ---
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (formData.name.trim().length < 2) 
      newErrors.name = "Full name is required (text only).";
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) 
      newErrors.email = "Please enter a valid business/personal email.";

    if (formData.phone.length !== 10) 
      newErrors.phone = "Phone number must be exactly 10 digits.";

    if (formData.experience.trim().length === 0) 
      newErrors.experience = "Experience details are required.";

    if (formData.skills.trim().length < 2) 
      newErrors.skills = "Please list your primary skills.";

    if (formData.preferredLocation.trim().length < 2) 
      newErrors.preferredLocation = "Enter a location (text only).";
      
    if (!formData.appliedJob)
       newErrors.appliedJob = "Please select a job role.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Handle Input Changes ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let filteredValue = value;

    // 1. STRICT: Block numbers in Name and Location
    if (name === "name" || name === "preferredLocation") {
      filteredValue = value.replace(/[0-9]/g, ""); 
    }

    // 2. STRICT: Allow only digits for Phone
    if (name === "phone") {
      filteredValue = value.replace(/\D/g, "").slice(0, 10);
    }

    // 3. STRICT: Allow only numbers/experience symbols for Exp
    if (name === "experience") {
      filteredValue = value.replace(/[^0-9.+-]/g, "");
    }

    setFormData(prev => ({ ...prev, [name]: filteredValue }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  };

  const handleApplyClick = (jobTitle: string, jobCompany: string) => {
    // ✅ FIX: Store both title and company using "||" as separator
    const combinedValue = jobCompany ? `${jobTitle}||${jobCompany}` : jobTitle;
    setFormData(prev => ({ ...prev, appliedJob: combinedValue }));
    const formSection = document.getElementById('register');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast({ 
        title: "Validation Error", 
        description: "Please check the highlighted fields.", 
        variant: "destructive" 
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // ✅ FIX: Split the combined "Title||Company" back into separate fields before sending
      const { appliedJob, ...rest } = formData;
      const [jobTitle, jobCompany] = appliedJob.includes("||")
        ? appliedJob.split("||")
        : [appliedJob, ""];

      const payload = {
        ...rest,
        appliedJob: jobTitle,
        appliedCompany: jobCompany, // Send company separately to backend
      };

      await axios.post(`${API_URL}/job-applications`, payload);
      toast({ 
        title: "Profile Submitted!", 
        description: `Application for ${jobTitle} sent successfully.` 
      });
      setFormData({ 
        name: "", email: "", phone: "", experience: "", 
        currentCompany: "", currentRole: "", appliedJob: "", 
        skills: "", preferredLocation: "", noticePeriod: "", message: "" 
      });
      setErrors({});
    } catch (error) {
      toast({ 
        title: "Submission Failed", 
        description: "Network error. Please try again later.", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredJobs = jobs.filter(
    (job: any) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase())
  );
const fileInputRef = useRef(null);
  return (
    <Layout>
      <HeroBanner
        image={heroCandidates}
        subtitle="For Job Seekers"
        title="Your Next Career Move Starts Here"
        description="Explore exciting opportunities with top companies across IT and Non-IT sectors."
      >
        {/* <Button variant="hero" size="lg" asChild><a href="#register">Upload Resume</a></Button> */}
        {/* <Button onClick={() => window.location.href="/candidates#register"}>Upload Resume</Button> */}
        <button
          onClick={() => fileInputRef.current.click()}
          className="bg-blue-500 text-white  px-8 py-3 rounded-full"
        >
          Update Profile
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept=".pdf,.doc,.docx"
        />
        <Button variant="hero-outline" size="lg" asChild><a href="#jobs">View Jobs</a></Button>
      </HeroBanner>

      {/* Jobs Search & Display Section */}
      <section id="jobs" className="section-padding scroll-mt-24">
        <div className="container-custom">
          <SectionHeading subtitle="Current Openings" title="Featured Job Opportunities" />
          
          <div className="mb-12 relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by role, location, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 rounded-2xl border-primary/20 focus:ring-primary shadow-sm"
            />
          </div>

          {jobsLoading ? (
            <div className="text-center py-20"><Loader2 className="animate-spin mx-auto w-10 h-10 text-primary" /></div>
          ) : jobsFailed ? (
            // Jobs couldn't load (server deploying / network issue) — show a soft banner
            <div className="col-span-full text-center py-20 bg-blue-50/60 rounded-2xl border-2 border-dashed border-blue-200">
              <Loader2 className="mx-auto w-8 h-8 text-blue-400 mb-3" />
              <p className="text-blue-700 font-semibold text-lg">Job listings are loading…</p>
              <p className="text-blue-500 text-sm mt-1">Our job board is updating. You can still <a href="#register" className="underline font-bold">submit your profile</a> now!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredJobs.length === 0 ? (
                <div className="col-span-full text-center py-20 text-muted-foreground bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
                  No matches found for "{searchTerm}".
                </div>
              ) : (
                filteredJobs.map((job: any, index) => (
                  <motion.div 
                    key={job._id || index} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card-hover p-6 flex flex-col justify-between border border-border bg-white dark:bg-slate-900 rounded-2xl shadow-sm relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 p-3">
                       <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-50 text-blue-600 px-2 py-1 rounded-md border border-blue-100">
                          {job.type || "Full-time"}
                       </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold font-heading text-gray-900 dark:text-white line-clamp-1 mb-1">{job.title}</h3>
                      <p className="text-primary font-bold text-sm mb-4 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-primary" /> {job.company}
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 text-primary/60" /> {job.location}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Briefcase className="w-4 h-4 text-primary/60" /> {job.experience} Required
                        </div>
                      </div>

                      {job.description && (
                        <p className="text-xs text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                          {job.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {Array.isArray(job.skills) ? job.skills.slice(0, 4).map((skill: string, i: number) => (
                          <span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md font-medium border border-slate-200 dark:border-slate-700">
                            {skill}
                          </span>
                        )) : null}
                        {job.skills?.length > 4 && <span className="text-[10px] text-muted-foreground">+{job.skills.length - 4} more</span>}
                      </div>
                    </div>

                    <Button 
                      className="w-full mt-auto font-bold group-hover:bg-primary transition-all rounded-xl" 
                      onClick={() => handleApplyClick(job.title, job.company)}
                    >
                      Apply Now <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </section>

      {/* Profile Submission Form Section */}
      <section id="register" className="section-padding scroll-mt-24 bg-muted/30">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <SectionHeading subtitle="Register with us" title="Join Our Talent Network" />
              <p className="text-muted-foreground mb-8 text-lg">
                Complete your profile to get discovered by top recruiters. We match your expertise with high-impact roles.
              </p>
              <div className="space-y-6">
                {benefits.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white/50 dark:bg-slate-900/50 p-4 rounded-xl border border-white dark:border-slate-800 shadow-sm">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    </div>
                    <span className="font-semibold text-gray-700 dark:text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="glass-card p-8 bg-white dark:bg-slate-950 shadow-2xl border border-border rounded-2xl"
            >
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* JOB SELECTION DROPDOWN */}
                <div className="space-y-2">
                  <Label className={`font-bold ${errors.appliedJob ? "text-destructive" : ""}`}>Applying For *</Label>
                  <select
                    name="appliedJob"
                    value={formData.appliedJob}
                    onChange={handleChange}
                    className={`flex h-12 w-full rounded-xl border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all ${errors.appliedJob ? "border-destructive" : "border-input"}`}
                  >
                    <option value="" disabled>
                      {jobsFailed ? "Select — or choose General Application below" : "Select a Job Role..."}
                    </option>
                    <option value="General Application">General Application (No specific role)</option>
                    {!jobsFailed && jobs.map((job: any) => (
                      <option key={job._id} value={`${job.title}||${job.company}`}>
                        {job.title} - {job.location} ({job.company})
                      </option>
                    ))}
                  </select>
                  {jobsFailed && (
                    <p className="text-[11px] text-blue-500 font-medium">
                      ℹ️ Specific job listings are updating — select "General Application" to continue.
                    </p>
                  )}
                  {errors.appliedJob && <p className="text-[10px] text-destructive font-medium">{errors.appliedJob}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className={`font-bold ${errors.name ? "text-destructive" : ""}`}>Full Name (Text only) *</Label>
                    <Input name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" className={`h-12 rounded-xl ${errors.name ? "border-destructive" : ""}`} />
                    {errors.name && <p className="text-[10px] text-destructive font-medium">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className={`font-bold ${errors.email ? "text-destructive" : ""}`}>Email Address *</Label>
                    <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" className={`h-12 rounded-xl ${errors.email ? "border-destructive" : ""}`} />
                    {errors.email && <p className="text-[10px] text-destructive font-medium">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className={`font-bold ${errors.phone ? "text-destructive" : ""}`}>Phone (10 digits) *</Label>
                    <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="9876543210" className={`h-12 rounded-xl ${errors.phone ? "border-destructive" : ""}`} />
                    {errors.phone && <p className="text-[10px] text-destructive font-medium">{errors.phone}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className={`font-bold ${errors.experience ? "text-destructive" : ""}`}>Exp Years (e.g. 2.5) *</Label>
                    <Input name="experience" value={formData.experience} onChange={handleChange} placeholder="Years" className={`h-12 rounded-xl ${errors.experience ? "border-destructive" : ""}`} />
                    {errors.experience && <p className="text-[10px] text-destructive font-medium">{errors.experience}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className={`font-bold ${errors.skills ? "text-destructive" : ""}`}>Key Skills *</Label>
                  <Input name="skills" value={formData.skills} onChange={handleChange} placeholder="React, Node.js, Project Management" className={`h-12 rounded-xl ${errors.skills ? "border-destructive" : ""}`} />
                  {errors.skills && <p className="text-[10px] text-destructive font-medium">{errors.skills}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className={`font-bold ${errors.preferredLocation ? "text-destructive" : ""}`}>Preferred Location *</Label>
                    <Input name="preferredLocation" value={formData.preferredLocation} onChange={handleChange} placeholder="e.g. Bangalore" className={`h-12 rounded-xl ${errors.preferredLocation ? "border-destructive" : ""}`} />
                    {errors.preferredLocation && <p className="text-[10px] text-destructive font-medium">{errors.preferredLocation}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Notice Period</Label>
                    <Input name="noticePeriod" value={formData.noticePeriod} onChange={handleChange} placeholder="e.g. 30 days" className="h-12 rounded-xl" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold">Message or Current Role</Label>
                  <Textarea name="message" value={formData.message} onChange={handleChange} placeholder="Tell us more about your career goals..." rows={3} className="rounded-xl" />
                </div>

                <Button type="submit" size="lg" className="w-full font-bold h-14 rounded-xl shadow-lg shadow-primary/20" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="animate-spin mr-2" /> Processing...</> : "Submit Application"}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <SectionHeading subtitle="FAQs" title="Common Questions" />
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="glass-card px-6 border-none bg-white dark:bg-slate-900 rounded-xl">
                  <AccordionTrigger className="text-left hover:no-underline font-bold py-5">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Candidates;