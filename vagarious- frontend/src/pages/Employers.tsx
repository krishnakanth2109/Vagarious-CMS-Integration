// import { useState } from "react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";
import { 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  Users, 
  Zap, 
  Shield,
  Clock,
  Award,
  Target,
  Laptop,
  HeartHandshake,
  Factory,
  ShoppingBag,
  Headphones,
  Send,
  Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/layout/Layout";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { useToast } from "@/hooks/use-toast";
import heroEmployers from "@/assets/hero-employers.jpg";

// --- Types ---
interface FormData {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  requirements: string;
  positions: string;
  location: string;
}

interface FormErrors {
  [key: string]: string;
}

const whyChoose = [
  { icon: Target, title: "Industry Expertise", description: "Strong understanding of both IT and Non-IT hiring landscapes enables accurate role-to-talent alignment." },
  { icon: Zap, title: "Efficient Hiring Timelines", description: "Optimized recruitment workflows support faster closures without compromising candidate quality." },
  { icon: Shield, title: "Quality Assurance", description: "Replacement support ensures hiring outcomes meet defined expectations." },
  { icon: Clock, title: "Dedicated Client Support", description: "A single, experienced point of contact manages the recruitment lifecycle end to end." },
  { icon: Award, title: "Cost Transparency", description: "Competitive and clearly defined pricing models with no hidden charges." },
  { icon: Users, title: "Extensive Talent Network", description: "Access to a large, pre-screened talent pool across multiple industries and locations in India." },
];

const engagementModels = [
  { title: "Contingency Hiring", description: "Outcome-based recruitment with payment upon successful hire.", features: ["No upfront fees", "Minimal risk", "Suitable for multiple open positions"] },
  { title: "Retained Search", description: "Dedicated search for senior leadership and critical roles.", features: ["Exclusive engagement", "Comprehensive market mapping", "Executive-level expertise"] },
  { title: "RPO Services", description: "End-to-end recruitment process management for high-volume or ongoing hiring needs.", features: ["Dedicated recruitment teams", "Full lifecycle ownership", "Scalable and cost-efficient"] },
];

const industries = [
  { icon: Laptop, name: "IT & Software", positions: "500+ positions filled" },
  { icon: Building2, name: "BFSI", positions: "300+ positions filled" },
  { icon: HeartHandshake, name: "Healthcare", positions: "200+ positions filled" },
  { icon: Factory, name: "Manufacturing", positions: "250+ positions filled" },
  { icon: ShoppingBag, name: "Retail & E-commerce", positions: "180+ positions filled" },
  { icon: Headphones, name: "BPO & Services", positions: "400+ positions filled" },
];

const hiringProcess = [
  { step: "1", title: "Requirement Intake", description: "Define role expectations, timelines, and hiring objectives." },
  { step: "2", title: "Role Consultation", description: "Sourcing and screening through our established talent networks and databases." },
  { step: "3", title: "Talent Identification", description: "We source and screen candidates from our extensive network" },
  { step: "4", title: "Candidate Shortlisting", description: "Presentation of qualified profiles within defined timelines." },
  { step: "5", title: "Interview Management", description: " End-to-end coordination, scheduling, and feedback management." },
  { step: "6", title: "Offer & Onboarding Support", description: " Assistance with offer finalization, negotiations, and smooth onboarding." },
];

const Employers = () => {
  const location = useLocation();

useEffect(() => {
  if (location.hash === "#hiring-form") {
    const element = document.getElementById("hiring-form");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }
}, [location]);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const API_URL = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    requirements: "",
    positions: "",
    location: "",
  });

  // --- Strict Submission Validation ---
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.companyName || formData.companyName.trim().length < 2) {
      newErrors.companyName = "Valid company name is required.";
    }
    if (!formData.contactPerson || formData.contactPerson.trim().length < 2) {
      newErrors.contactPerson = "Contact person name is required.";
    }
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid professional email address.";
    }

    if (formData.phone.length !== 10) {
      newErrors.phone = "Phone number must be exactly 10 digits.";
    }

    if (!formData.requirements || formData.requirements.trim().length < 20) {
      newErrors.requirements = "Please provide more detail (min 20 characters).";
    }

    if (!formData.location || formData.location.trim().length < 2) {
      newErrors.location = "Job location is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      toast({
        title: "Validation Error",
        description: "Please correct the highlighted errors.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/employer-requirements`, formData);

      if (response.data.success) {
        toast({
          title: "Requirement Submitted Successfully!",
          description: "Our recruitment team will contact you within 24 hours.",
        });

        setFormData({
          companyName: "",
          contactPerson: "",
          email: "",
          phone: "",
          requirements: "",
          positions: "",
          location: "",
        });
        setErrors({});
      }
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.response?.data?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let filteredValue = value;

    // --- STRICT INPUT FILTERING ---
    // 1. Prevent numbers in Name, Location, and Company Name
    if (["contactPerson", "location", "companyName"].includes(name)) {
      filteredValue = value.replace(/[0-9]/g, ""); 
    }

    // 2. Prevent letters/symbols in Phone and Positions
    if (["phone", "positions"].includes(name)) {
      filteredValue = value.replace(/\D/g, ""); // Allow only digits
      if (name === "phone") filteredValue = filteredValue.slice(0, 10); // Limit phone to 10
    }

    setFormData(prev => ({ ...prev, [name]: filteredValue }));

    // Clear error message when user starts correcting the field
    if (errors[name]) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  };

  return (
    <Layout>
      <HeroBanner
        image={heroEmployers}
        subtitle="For Employers"
        title="Build Your Dream Team With Us"
        description="Partner with Vagarious Solutions for reliable, efficient, and cost-effective recruitment. We understand your business and deliver candidates who make a difference."
      >
        <Button variant="hero" size="lg" asChild>
          <a href="#hiring-form">Submit Requirement</a>
        </Button>
        <Button variant="hero-outline" size="lg" asChild>
          <Link to="/contact">Talk to Expert</Link>
        </Button>
      </HeroBanner>

      {/* Why Choose Us */}
      <section className="section-padding">
        <div className="container-custom">
          <SectionHeading
            subtitle="Why Choose Vagarious"
            title="A Trusted Partner in Talent Acquisition"
            description="We combine deep market knowledge with a consultative approach to deliver consistent, high-quality hiring outcomes across IT and Non-IT domains."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChoose.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 p-6 glass-card-hover"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-heading mb-1">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <SectionHeading
            subtitle="How We Work"
            title="Structured and Transparent Hiring Approach"
            description="Our process is designed to simplify recruitment while maintaining control, visibility, and speed."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hiringProcess.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative glass-card p-6"
              >
                <span className="absolute -top-4 left-6 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-sky-dark flex items-center justify-center text-primary-foreground font-bold">
                  {item.step}
                </span>
                <h3 className="text-lg font-bold font-heading mb-2 mt-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Engagement Models */}
      <section className="section-padding">
        <div className="container-custom">
          <SectionHeading
            subtitle="Engagement Models"
            title="Flexible Hiring Partnerships"
            description="Choose an engagement model aligned with your hiring volume, role criticality, and budget."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {engagementModels.map((model, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card-hover p-6 text-center"
              >
                <h3 className="text-xl font-bold font-heading mb-2">{model.title}</h3>
                <p className="text-muted-foreground mb-4">{model.description}</p>
                <ul className="space-y-2">
                  {model.features.map((feature, i) => (
                    <li key={i} className="flex items-center justify-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="section-padding bg-secondary text-secondary-foreground">
        <div className="container-custom">
          <SectionHeading
            subtitle="Industries We Serve"
            title="Expertise Across Sectors"
            description="Our recruiters have deep domain knowledge across multiple industries."
            light
          />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {industries.map((industry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-secondary-foreground/5 rounded-2xl p-4 text-center border border-secondary-foreground/10 hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 mx-auto mb-3 flex items-center justify-center">
                  <industry.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{industry.name}</h3>
                <p className="text-xs text-secondary-foreground/60">{industry.positions}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Hiring Form */}
      <section id="hiring-form" className="section-padding scroll-mt-24">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">
                Get Started
              </p>
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">
                Submit Your Hiring Requirement
              </h2>
              <p className="text-muted-foreground mb-8">
                Fill in the form and our recruitment specialist will get back to you within 24 hours 
                to discuss your requirements in detail.
              </p>
              <div className="space-y-4">
                {[
                  "Quick response within 24 hours",
                  "Free consultation on hiring strategy",
                  "No obligation quote",
                  "Dedicated account manager",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 bg-white dark:bg-slate-950 border border-border shadow-2xl"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className={errors.companyName ? "text-destructive" : ""}>Company Name (Text only) *</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Your company"
                      className={errors.companyName ? "border-destructive focus-visible:ring-destructive" : ""}
                    />
                    {errors.companyName && <p className="text-[10px] text-destructive mt-1">{errors.companyName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson" className={errors.contactPerson ? "text-destructive" : ""}>Contact Person (Text only) *</Label>
                    <Input
                      id="contactPerson"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleChange}
                      placeholder="Your name"
                      className={errors.contactPerson ? "border-destructive focus-visible:ring-destructive" : ""}
                    />
                    {errors.contactPerson && <p className="text-[10px] text-destructive mt-1">{errors.contactPerson}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className={errors.email ? "text-destructive" : ""}>Business Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="hr@company.com"
                      className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                    />
                    {errors.email && <p className="text-[10px] text-destructive mt-1">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className={errors.phone ? "text-destructive" : ""}>Phone (10 Digits only) *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className={errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}
                    />
                    {errors.phone && <p className="text-[10px] text-destructive mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="positions">No. of Positions (Numbers only)</Label>
                    <Input
                      id="positions"
                      name="positions"
                      value={formData.positions}
                      onChange={handleChange}
                      placeholder="e.g. 10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className={errors.location ? "text-destructive" : ""}>Job Location (Text only) *</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Hyderabad"
                      className={errors.location ? "border-destructive focus-visible:ring-destructive" : ""}
                    />
                    {errors.location && <p className="text-[10px] text-destructive mt-1">{errors.location}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements" className={errors.requirements ? "text-destructive" : ""}>Job Requirements (Min 20 characters) *</Label>
                  <Textarea
                    id="requirements"
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    placeholder="Describe roles, skills, experience..."
                    rows={4}
                    className={errors.requirements ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {errors.requirements && <p className="text-[10px] text-destructive mt-1">{errors.requirements}</p>}
                </div>

                <Button type="submit" size="lg" className="w-full font-bold" disabled={loading}>
                  {loading ? (
                    <>Submitting... <Loader2 className="w-5 h-5 ml-2 animate-spin" /></>
                  ) : (
                    <>Submit Requirement <Send className="w-5 h-5 ml-2" /></>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Employers;