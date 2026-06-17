import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Code2, 
  Database, 
  Cloud, 
  Shield, 
  TestTube2,
  Users,
  BarChart3,
  Briefcase,
  Calculator,
  Headphones,
  Building2,
  CheckCircle2,
  Clock,
  UserPlus,
  UsersRound,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { SectionHeading } from "@/components/shared/SectionHeading";
import heroServices from "@/assets/hero-services.jpg";

const itServices = [
  {
    icon: Code2,
    title: "Software Development",
    roles: ["Full Stack Developers", "Frontend/Backend Developers", "Mobile App Developers", "UI/UX Designers"],
    link: "/ITRecruitment"
  },
  {
    icon: TestTube2,
    title: "Testing & QA",
    roles: ["Manual Testers", "Automation Engineers", "Performance Testers", "QA Leads"],
    link: "/ITRecruitment"
  },
  {
    icon: Cloud,
    title: "Cloud & DevOps",
    roles: ["AWS/Azure/GCP Engineers", "DevOps Engineers", "Site Reliability Engineers", "Cloud Architects"],
    link: "/ITRecruitment"
  },
  {
    icon: Database,
    title: "Data & Analytics",
    roles: ["Data Scientists", "Data Engineers", "BI Analysts", "ML Engineers"],
    link: "/ITRecruitment"
  },
  {
    icon: Shield,
    title: "Cybersecurity",
    roles: ["Security Analysts", "Penetration Testers", "Security Architects", "Compliance Officers"],
    link: "/ITRecruitment"
  },
  {
    icon: Headphones,
    title: "IT Support",
    roles: ["System Administrators", "Network Engineers", "Help Desk Support", "IT Managers"],
    link: "/ITRecruitment"
  },
];

const nonItServices = [
  {
    icon: BarChart3,
    title: "Sales & Marketing",
    roles: ["Sales Executives", "Business Development", "Digital Marketing", "Brand Managers"],
    link: "/NonITRecruitment"
  },
  {
    icon: Users,
    title: "Human Resources",
    roles: ["HR Managers", "Talent Acquisition", "HR Business Partners", "L&D Specialists"],
    link: "/NonITRecruitment"
  },
  {
    icon: Calculator,
    title: "Finance & Accounts",
    roles: ["Accountants", "Financial Analysts", "Audit Professionals", "CFO/Finance Heads"],
    link: "/NonITRecruitment"
  },
  {
    icon: Building2,
    title: "Operations",
    roles: ["Operations Managers", "Supply Chain", "Logistics Coordinators", "Process Improvement"],
    link: "/NonITRecruitment"
  },
  {
    icon: Briefcase,
    title: "Admin & Secretarial",
    roles: ["Executive Assistants", "Office Managers", "Administrative Staff", "Receptionists"],
    link: "/NonITRecruitment"
  },
  {
    icon: Headphones,
    title: "Customer Support",
    roles: ["Customer Service Reps", "Call Center Agents", "Customer Success", "Support Managers"],
    link: "/NonITRecruitment"
  },
];

const staffingModels = [
  {
    icon: UserPlus,
    title: "Permanent Staffing",
    description: "Find dedicated full-time employees who become integral parts of your team. We ensure cultural fit and long-term commitment.",
    features: ["Comprehensive background verification", "Skill assessment & aptitude testing", "Cultural fit evaluation", "Salary negotiation support"],
    color: "from-blue-500 to-cyan-500",
    link: "/StaffingModels"
  },
  {
    icon: Clock,
    title: "Contract Staffing",
    description: "Flexible hiring solutions for project-based needs, seasonal demands, or specialized skill requirements.",
    features: ["Quick deployment", "Flexible engagement terms", "Payroll management included", "Easy extension or conversion"],
    color: "from-purple-500 to-pink-500",
    link: "/StaffingModels"
  },
  
  {
    icon: Building2,
    title: "Executive Search",
    description: "Specialized headhunting services for CXO-level and senior leadership positions requiring discretion and expertise.",
    features: ["Confidential search process", "Leadership assessment", "Reference verification", "Onboarding support"],
    color: "from-orange-500 to-red-500",
    link: "/StaffingModels"
  },
];

const process = [
  { step: "01", title: "Requirement Analysis", description: "Understanding your hiring needs, role specifications, and organizational culture." },
  { step: "02", title: "Talent Sourcing", description: "Leveraging our extensive database and networks to identify potential candidates." },
  { step: "03", title: "Screening & Assessment", description: "Rigorous evaluation through interviews, skill tests, and background checks." },
  { step: "04", title: "Shortlist Presentation", description: "Presenting qualified candidates with detailed profiles for your review." },
  { step: "05", title: "Interview Coordination", description: "Scheduling and managing interviews between you and shortlisted candidates." },
  { step: "06", title: "Offer & Onboarding", description: "Facilitating offer negotiations and ensuring smooth onboarding." },
];

const Services = () => {
  return (
    <Layout>
      <HeroBanner
        image={heroServices}
        subtitle="Our Services"
        title="End-to-End Recruitment Solutions"
        description="From IT specialists to business professionals, we offer comprehensive staffing solutions tailored to your unique needs and growth objectives."
      >
        <Button variant="hero" size="lg" asChild>
          {/* <Link to="/employers">Submit Requirement</Link> */}
          <Link to="/employers#hiring-form">Submit Requirement</Link>
        </Button>
        <Button variant="hero-outline" size="lg" asChild>
          <Link to="/contact">Talk to Expert</Link>
        </Button>
      </HeroBanner>

      {/* IT Recruitment */}
      <section id="it" className="section-padding scroll-mt-24">
        <div className="container-custom">
          <SectionHeading
            subtitle="IT Recruitment"
            title="Technology Talent Solutions"
            description="Access top-tier tech talent across all domains. From developers to architects, we help you build high-performing technology teams."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card-hover p-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                  <service.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold font-heading mb-3">{service.title}</h3>
                <ul className="space-y-2">
                  {service.roles.map((role, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      {role}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                 
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link to="/ITRecruitment" className="gap-2">
                Explore All IT Recruitment Services <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Non-IT Recruitment */}
      <section id="non-it" className="section-padding bg-muted/50 scroll-mt-24">
        <div className="container-custom">
          <SectionHeading
            subtitle="Non-IT Recruitment"
            title="Business & Corporate Hiring"
            description="Beyond technology, we excel in recruiting professionals across sales, marketing, HR, finance, operations, and more."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nonItServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card-hover p-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                  <service.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold font-heading mb-3">{service.title}</h3>
                <ul className="space-y-2">
                  {service.roles.map((role, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      {role}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link to="/NonITRecruitment" className="gap-2">
                Explore All Non-IT Recruitment Services <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Staffing Models */}
      <section id="staffing" className="section-padding scroll-mt-24">
        <div className="container-custom">
          <SectionHeading
            subtitle="Staffing Models"
            title="Flexible Engagement Options"
            description="Choose the hiring model that best suits your business needs – from permanent placements to contract staffing and bulk hiring."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {staffingModels.map((model, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card overflow-hidden"
              >
                <div className={`h-2 bg-gradient-to-r ${model.color}`} />
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${model.color} flex items-center justify-center flex-shrink-0`}>
                      <model.icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-heading">{model.title}</h3>
                      <p className="text-muted-foreground mt-1">{model.description}</p>
                    </div>
                  </div>
                  <ul className="grid grid-cols-2 gap-2 mb-6">
                    {model.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
              
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link to="/StaffingModels" className="gap-2">
                Explore All Staffing Models <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="section-padding bg-blue-50 dark:bg-blue-900/20">
        <div className="container-custom">
          <SectionHeading
            subtitle="Our Process"
            title="How We Deliver Results"
            description="A streamlined, transparent recruitment process designed to find the perfect match quickly and efficiently."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {process.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-5xl font-bold font-heading text-blue-100 dark:text-blue-900/30 absolute top-4 right-4">
                  {item.step}
                </span>
                <h3 className="text-lg font-bold font-heading mb-2 relative z-10">{item.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 relative z-10">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
              Ready to Find Your Perfect Talent?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Let's discuss your hiring needs and create a customized recruitment strategy for your organization.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/employers">
                  Submit Requirement <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Services;