import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios"; // Import Axios
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Send,
  MessageSquare,
  Building2,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/layout/Layout";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { useToast } from "@/hooks/use-toast";
import heroContact from "@/assets/hero-contact.jpg";

interface FormErrors {
  [key: string]: string;
}

// Configuration for API URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const contactInfo = [
  {
    icon: Building2,
    title: "Head Office",
    lines: ["Ground Floor, Shanmukh Empire, 83, Ayyappa Society Main Road, Madhapur, Hyderabad, Telangana-500081"],
  },
  {
    icon: Phone,
    title: "Phone",
    lines: ["+91 8919801095", "+91 6304244117"],
  },
  {
    icon: Mail,
    title: "Email",
    lines: ["ops@vagarioussolutions.com"],
  },
  {
    icon: Clock,
    title: "Business Hours",
    lines: ["Monday - Saturday: 9:00 AM - 6:00 PM"],
  },
];

const Contact = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  // --- Strict Validation Rules ---
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (formData.name.trim().length < 2) {
      newErrors.name = "Full name is required (text only).";
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (formData.phone.length !== 10) {
      newErrors.phone = "Phone number must be exactly 10 digits.";
    }

    if (formData.subject.trim().length < 3) {
      newErrors.subject = "Subject is required (text only).";
    }

    if (formData.message.trim().length < 20) {
      newErrors.message = "Message must be at least 20 characters long.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Handle Real-time Input Filtering ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let filteredValue = value;

    // STRICT: Prevent numbers in Name and Subject
    if (name === "name" || name === "subject") {
      filteredValue = value.replace(/[0-9]/g, ""); 
    }

    // STRICT: Prevent letters/symbols in Phone
    if (name === "phone") {
      filteredValue = value.replace(/\D/g, "").slice(0, 10); 
    }

    setFormData(prev => ({ ...prev, [name]: filteredValue }));

    // Clear error for this field as the user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  };

  // --- Handle Form Submission (Connected to Backend) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // 1. Send Data to Backend
      await axios.post(`${API_URL}/contact`, formData);

      // 2. Success Feedback
      toast({
        title: "Message Sent Successfully!",
        description: "Thank you. Our team will contact you within 24 hours.",
        action: <CheckCircle2 className="text-green-500 w-5 h-5" />
      });

      // 3. Reset Form
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setErrors({});

    } catch (error: any) {
      console.error("Submission Error:", error);
      const errorMsg = error.response?.data?.message || "Something went wrong. Please try again.";
      
      toast({
        title: "Message Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <HeroBanner
        image={heroContact}
        subtitle="Get in Touch"
        title="We'd Love to Hear From You"
        description="Whether you're looking to hire talent or find your dream job, our team is here to help. Reach out to us today."
      />

      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-1"
            >
              <h2 className="text-2xl font-bold font-heading mb-6">Contact Information</h2>
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{info.title}</h3>
                      {info.lines.map((line, i) => (
                        <p key={i} className="text-muted-foreground text-sm">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Map Embed */}
              <div className="mt-8">
                <h3 className="font-semibold mb-4">Find Us</h3>
                <div className="aspect-video rounded-2xl overflow-hidden glass-card border border-border">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.3361131102656!2d78.3891823751662!3d17.44360348345479!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb916300000001%3A0xc665191319208796!2sShanmukh%20Empire!5e0!3m2!1sen!2sin!4v1715264000000!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    className="grayscale hover:grayscale-0 transition-all duration-500"
                  />
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <div className="glass-card p-8 border border-border shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-heading">Send Us a Message</h2>
                    <p className="text-muted-foreground text-sm">Strict validation enabled for quality support</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className={errors.name ? "text-destructive" : ""}>Full Name (Text only) *</Label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. John Doe"
                        className={errors.name ? "border-destructive focus-visible:ring-destructive" : "bg-background/50"}
                      />
                      {errors.name && <p className="text-[10px] text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className={errors.email ? "text-destructive" : ""}>Email Address *</Label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="email@example.com"
                        className={errors.email ? "border-destructive focus-visible:ring-destructive" : "bg-background/50"}
                      />
                      {errors.email && <p className="text-[10px] text-destructive">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className={errors.phone ? "text-destructive" : ""}>Phone (10 digits) *</Label>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="9876543210"
                        className={errors.phone ? "border-destructive focus-visible:ring-destructive" : "bg-background/50"}
                      />
                      {errors.phone && <p className="text-[10px] text-destructive">{errors.phone}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className={errors.subject ? "text-destructive" : ""}>Subject (Text only) *</Label>
                      <Input
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Inquiry Topic"
                        className={errors.subject ? "border-destructive focus-visible:ring-destructive" : "bg-background/50"}
                      />
                      {errors.subject && <p className="text-[10px] text-destructive">{errors.subject}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className={errors.message ? "text-destructive" : ""}>Your Message (Min 20 chars) *</Label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Please describe your inquiry..."
                      rows={6}
                      className={errors.message ? "border-destructive focus-visible:ring-destructive" : "bg-background/50"}
                    />
                    {errors.message && <p className="text-[10px] text-destructive">{errors.message}</p>}
                  </div>

                  <Button type="submit" size="lg" className="w-full md:w-auto gap-2 font-bold" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : "Send Message"} <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Contact Info */}
      <section className="section-padding bg-slate-50 dark:bg-slate-900/50 border-t border-border">
        <div className="container-custom">
          <div className="text-center">
            <h2 className="text-3xl font-bold font-heading mb-4">Need Immediate Assistance?</h2>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Button size="lg" className="rounded-full px-8" asChild>
                <a href="tel:+918919801095"><Phone className="mr-2 w-5 h-5" /> Call Us Now</a>
              </Button>
              <Button variant="outline" size="lg" className="rounded-full px-8" asChild>
                <a href="mailto:ops@vagarioussolutions.com"><Mail className="mr-2 w-5 h-5" /> Email Us</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;