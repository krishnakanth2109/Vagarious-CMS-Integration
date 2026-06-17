import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  BarChart3,
  Users,
  Calculator,
  Building2,
  Briefcase,
  Headphones,
  Target,
  DollarSign,
  MessageSquare,
  FileText,
  ShoppingBag,
  Truck,
  Factory,
  Heart,
  GraduationCap,
  CheckCircle2,
  Shield,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { SectionHeading } from "@/components/shared/SectionHeading";
import heroNonIT from "@/assets/hero-employers.jpg";

const nonItRoles = [
  {
    icon: BarChart3,
    title: "Sales & Marketing",
    description: "Drive revenue growth with expert sales professionals and marketing strategists.",
    positions: ["Sales Executives", "Business Development", "Digital Marketing", "Brand Managers", "Market Research"],
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Users,
    title: "Human Resources",
    description: "Build strong organizational culture with HR experts and talent management professionals.",
    positions: ["HR Managers", "Talent Acquisition", "HR Business Partners", "L&D Specialists", "Compensation & Benefits"],
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Calculator,
    title: "Finance & Accounting",
    description: "Financial experts for accounting, auditing, financial analysis, and strategic planning.",
    positions: ["Accountants", "Financial Analysts", "Auditors", "Tax Consultants", "Finance Controllers"],
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Building2,
    title: "Operations & Supply Chain",
    description: "Streamline operations with logistics, supply chain, and process improvement experts.",
    positions: ["Operations Managers", "Supply Chain", "Logistics Coordinators", "Process Improvement", "Quality Control"],
    color: "from-orange-500 to-red-500"
  },
  {
    icon: Briefcase,
    title: "Admin & Secretarial",
    description: "Efficient administrative professionals to support business operations.",
    positions: ["Executive Assistants", "Office Managers", "Administrative Staff", "Receptionists", "Facility Managers"],
    color: "from-yellow-500 to-amber-500"
  },
  {
    icon: Headphones,
    title: "Customer Support",
    description: "Enhance customer experience with support and service professionals.",
    positions: ["Customer Service Reps", "Call Center Agents", "Customer Success", "Support Managers", "Technical Support"],
    color: "from-indigo-500 to-blue-500"
  }
];

const industries = [
  {
    icon: ShoppingBag,
    title: "Retail & E-commerce",
    roles: ["Store Managers", "Merchandisers", "Buyers", "E-commerce Managers", "Customer Service"],
    color: "bg-blue-100 dark:bg-blue-900/20"
  },
  {
    icon: Factory,
    title: "Manufacturing",
    roles: ["Production Managers", "Quality Assurance", "Plant Managers", "Maintenance Engineers", "Safety Officers"],
    color: "bg-green-100 dark:bg-green-900/20"
  },
  {
    icon: Heart,
    title: "Healthcare",
    roles: ["Hospital Administrators", "Medical Representatives", "Healthcare Managers", "Clinical Staff", "Patient Care"],
    color: "bg-red-100 dark:bg-red-900/20"
  },
  {
    icon: GraduationCap,
    title: "Education",
    roles: ["Academic Coordinators", "Administrators", "Counselors", "Trainers", "Admissions Officers"],
    color: "bg-purple-100 dark:bg-purple-900/20"
  },
  {
    icon: Truck,
    title: "Logistics & Transportation",
    roles: ["Logistics Managers", "Fleet Managers", "Dispatch Coordinators", "Warehouse Managers", "Transport Planners"],
    color: "bg-orange-100 dark:bg-orange-900/20"
  },
  {
    icon: DollarSign,
    title: "Banking & Finance",
    roles: ["Banking Officers", "Loan Processors", "Relationship Managers", "Compliance Officers", "Investment Advisors"],
    color: "bg-cyan-100 dark:bg-cyan-900/20"
  }
];

const process = [
  { 
    step: "01", 
    title: "Business Requirement Analysis", 
    description: "Understand your business needs, department structure, and role-specific requirements.",
    icon: Target 
  },
  { 
    step: "02", 
    title: "Candidate Profiling", 
    description: "Create detailed candidate profiles matching skills, experience, and cultural fit.",
    icon: FileText 
  },
  { 
    step: "03", 
    title: "Strategic Sourcing", 
    description: "Leverage industry networks and specialized channels to find qualified candidates.",
    icon: Users 
  },
  { 
    step: "04", 
    title: "Competency Assessment", 
    description: "Comprehensive evaluation of skills, experience, and industry knowledge.",
    icon: CheckCircle2 
  },
  { 
    step: "05", 
    title: "Cultural Fit Evaluation", 
    description: "Assess alignment with organizational values and team dynamics.",
    icon: Shield 
  },
  { 
    step: "06", 
    title: "Onboarding & Integration", 
    description: "Ensure smooth transition and integration into your organizational structure.",
    icon: Zap 
  }
];

const benefits = [
  {
    title: "Industry-Specific Expertise",
    description: "Deep understanding of non-IT domain requirements and industry standards."
  },
  {
    title: "Cultural Fit Focus",
    description: "Prioritize candidates who align with your organizational culture and values."
  },
  {
    title: "Quick Turnaround",
    description: "Efficient process for urgent hiring needs across all business functions."
  },
  {
    title: "Scalable Solutions",
    description: "Flexible hiring solutions for startups to large enterprises."
  }
];

const NonITRecruitment = () => {
  return (
    <Layout>
      <HeroBanner
        image={heroNonIT}
        subtitle="Non-IT Recruitment"
        title="Building Exceptional Business Teams"
        description="We specialize in recruiting top talent across sales, marketing, HR, finance, operations, and all business functions to drive your organizational success."
      >
        <Button variant="hero" size="lg" asChild>
          <Link to="/employers">Hire Business Talent</Link>
        </Button>
        <Button variant="hero-outline" size="lg" asChild>
          <Link to="/contact">Schedule Consultation</Link>
        </Button>
      </HeroBanner>

      {/* Non-IT Roles */}
      <section className="section-padding scroll-mt-24">
        <div className="container-custom">
          <SectionHeading
            subtitle="Business Functions"
            title="Comprehensive Non-IT Recruitment"
            description="We recruit across all business domains to help you build a complete, high-performing organization."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nonItRoles.map((role, index) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card-hover p-6"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-4`}>
                  <role.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold font-heading mb-2">{role.title}</h3>
                <p className="text-muted-foreground mb-4 text-sm">{role.description}</p>
                <ul className="space-y-2">
                  {role.positions.map((position, i) => (
                    <li key={i} className="flex items-center gap-2 text-muted-foreground text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      {position}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Specializations */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <SectionHeading
            subtitle="Industry Expertise"
            title="Non-IT Talent Across Industries"
            description="We understand the unique staffing needs of different industries and provide tailored recruitment solutions."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((industry, index) => (
              <motion.div
                key={industry.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card-hover p-6"
              >
                <div className={`w-12 h-12 rounded-xl ${industry.color} flex items-center justify-center mb-4`}>
                  <industry.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold font-heading mb-3">{industry.title}</h3>
                <ul className="space-y-2">
                  {industry.roles.map((role, i) => (
                    <li key={i} className="flex items-center gap-2 text-muted-foreground text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      {role}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-padding">
        <div className="container-custom">
          <SectionHeading
            subtitle="Why Choose Us"
            title="Our Non-IT Recruitment Advantages"
            description="We go beyond traditional recruitment to deliver exceptional talent solutions for your business."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card-hover p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-heading mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section-padding bg-secondary text-secondary-foreground">
        <div className="container-custom">
          <SectionHeading
            subtitle="Our Process"
            title="Strategic Business Recruitment Framework"
            description="A specialized approach to identifying and securing top business talent for your organization."
            light
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {process.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative bg-secondary-foreground/5 rounded-2xl p-6 border border-secondary-foreground/10"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-3xl font-bold font-heading text-primary/30">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold font-heading mb-2">{step.title}</h3>
                <p className="text-secondary-foreground/70 text-sm">{step.description}</p>
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
              Ready to Strengthen Your Business Team?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Let's discuss your business hiring needs and find the perfect talent to drive your growth.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/employers">
                  Hire Business Professionals <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/contact">Get Business Consultation</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default NonITRecruitment;