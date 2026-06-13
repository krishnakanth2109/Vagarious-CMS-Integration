import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Clock,
  Calendar,
  DollarSign,
  Users,
  Briefcase,
  Shield,
  CheckCircle2,
  Zap,
  Target,
  BarChart,
  FileText,
  Building2,
  Cpu,
  Globe,
  Wrench,
  Headphones
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { SectionHeading } from "@/components/shared/SectionHeading";

import heroContract from "@/assets/hero-services.jpg"; // Temporary use services image

const contractTypes = [
  {
    icon: Clock,
    title: "Short-term Contracts",
    duration: "1-6 months",
    description: "Designed for immediate project requirements or temporary skill gaps.",
    features: ["Rapid deployment", "Flexible engagement terms", "No long-term commitment", "Access to niche expertise"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Calendar,
    title: "Long-term Contracts",
    duration: "6-24 months",
    description: "Ideal for extended projects and ongoing specialized roles.",
    features: ["Cost-efficient workforce planning", "Greater role stability", "Dedicated contract resources", "Improved continuity and knowledge retention"],
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Zap,
    title: "Project-Based Contracts",
    duration: "Project duration",
    description: " End-to-end execution with dedicated contract teams aligned to project scope.",
    features: ["Fixed deliverables and timelines", "Milestone-based execution", "Centralized team coordination", "Quality and performance oversight"],
    color: "from-orange-500 to-red-500",
  },
  {
    icon: DollarSign,
    title: "Managed Services",
    duration: "12+ months",
    description: "Comprehensive management of specific business functions or operations.",
    features: ["Defined service level agreements (SLAs)", "Performance-driven metrics", "Regular reporting and governance", "Continuous optimization and improvement"],
    color: "from-green-500 to-emerald-500",
  },
];

const contractBenefits = [
  {
    icon: Target,
    title: "Workforce Flexibility & Scalability",
    description: "Adjust team size based on evolving project and business demands.",
    color: "bg-blue-100 dark:bg-blue-900/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: DollarSign,
    title: "Cost Optimization",
    description: " Control hiring and operational costs without compromising on skill quality.",
    color: "bg-green-100 dark:bg-green-900/20",
    iconColor: "text-green-600 dark:text-green-400",
  },
  {
    icon: Users,
    title: "Access to Specialized Talent",
    description: "Leverage a ready pool of experienced professionals across domains.",
    color: "bg-purple-100 dark:bg-purple-900/20",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    icon: Shield,
    title: "Risk Reduction",
    description: "Mitigate hiring and compliance risks through structured vetting and management.",
    color: "bg-orange-100 dark:bg-orange-900/20",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  {
    icon: BarChart,
    title: "Faster Deployment",
    description: "Onboard qualified resources quickly to meet urgent timelines.",
    color: "bg-cyan-100 dark:bg-cyan-900/20",
    iconColor: "text-cyan-600 dark:text-cyan-400",
  },
  {
    icon: FileText,
    title: "Compliance & Legal Management",
    description: "End-to-end handling of contracts, payroll, and statutory requirements.",
    color: "bg-pink-100 dark:bg-pink-900/20",
    iconColor: "text-pink-600 dark:text-pink-400",
  },
];

const industries = [
  {
    icon: Cpu,
    title: "IT & Technology",
    roles: ["Software Development", "DevOps", "Cloud ", "Data & Analytics", "Cybersecurity"],
  },
  {
    icon: Building2,
    title: "Engineering & Manufacturing",
    roles: ["Project Engineering", "Quality", "Production ", "Maintenance "],
  },
  {
    icon: Globe,
    title: "Digital Marketing",
    roles: ["SEO", "Content ", "Social Media ", "Performance Marketing", "Analytics"],
  },
  {
    icon: Wrench,
    title: "Healthcare & Pharma",
    roles: ["Clinical Research", "Regulatory Affairs", "Medical Writing ", "Quality", "Pharmacovigilance"],
  },
  {
    icon: Headphones,
    title: "Customer Support",
    roles: ["Support Executives", "Team Leads", "Quality Analysts", "Trainers ", "Operations Managers"],
  },
  {
    icon: Briefcase,
    title: "Finance & Accounting",
    roles: ["Accounting ", "Financial Analysis", "Audit ", "Taxation ", " Financial Control"],
  },
];

const processSteps = [
  { 
    step: "01", 
    title: "Requirement Assessment", 
    description: "Understand role scope, duration, skills, and delivery timelines.",
    icon: FileText 
  },
  { 
    step: "02", 
    title: "Talent Identification", 
    description: "Shortlist pre-vetted contract professionals from our talent network.",
    icon: Users 
  },
  { 
    step: "03", 
    title: "Profile Presentation", 
    description: "Share detailed candidate profiles with availability and role fit.",
    icon: Target 
  },
  { 
    step: "04", 
    title: "Interview & Selection", 
    description: "Coordinate evaluations and support final decision-making.",
    icon: Headphones 
  },
  { 
    step: "05", 
    title: "Contract Management", 
    description: "Handle documentation, compliance, and engagement terms.",
    icon: FileText 
  },
  { 
    step: "06", 
    title: "Onboarding & Ongoing Support", 
    description: " Ensure smooth onboarding, performance tracking, and continuous support.",
    icon: CheckCircle2 
  },
];

const Contract = () => {
  return (
    <Layout>
      <HeroBanner
        image={heroContract}
        subtitle="Contract Staffing"
        title="Flexible Talent Solutions for Dynamic Business Needs"
        description="Access specialized skills on demand with our comprehensive contract staffing solutions. Scale your team efficiently while maintaining quality and reducing overhead costs."
      >
       
        <Button variant="hero-outline" size="lg" asChild>
          <Link to="/contact">Get a Consultation</Link>
        </Button>
      </HeroBanner>

      {/* Contract Types */}
      <section className="section-padding scroll-mt-24">
        <div className="container-custom">
          <SectionHeading
            subtitle="Contract Models"
            title="Flexible Engagement Frameworks for Modern Businesses"
            description="Our contract staffing solutions are designed to support dynamic business needs, project timelines, and specialized skill requirements—without long-term obligations."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contractTypes.map((model, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card-hover p-6"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${model.color} flex items-center justify-center flex-shrink-0`}>
                    <model.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-heading">{model.title}</h3>
                    <div className="inline-flex items-center gap-2 px-3 py-1 mt-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                      <Clock className="w-3 h-3" />
                      <span className="text-sm font-medium">{model.duration}</span>
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">{model.description}</p>
                <ul className="space-y-2">
                  {model.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <SectionHeading
            subtitle="Why Contract Staffing Works"
            title="Business Advantages"
            description="Contract staffing enables organizations to remain agile while maintaining access to skilled talent."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contractBenefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card-hover p-6"
              >
                <div className={`w-12 h-12 rounded-xl ${benefit.color} flex items-center justify-center mb-4`}>
                  <benefit.icon className={`w-6 h-6 ${benefit.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold font-heading mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries & Roles */}
      <section className="section-padding">
        <div className="container-custom">
          <SectionHeading
            subtitle="Industries We Support"
            title="Contract Talent Across Multiple Domains"
            description="We deliver contract staffing solutions across diverse industries, ensuring domain-specific expertise and operational alignment."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((industry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card-hover p-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-sky-dark flex items-center justify-center mb-4">
                  <industry.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold font-heading mb-3">{industry.title}</h3>
                <ul className="space-y-2">
                  {industry.roles.map((role, i) => (
                    <li key={i} className="flex items-center gap-2 text-muted-foreground text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      {role}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section-padding bg-secondary text-secondary-foreground">
        <div className="container-custom">
          <SectionHeading
            subtitle="Our Contract Staffing Process"
            title="A Structured, End-to-End Delivery Model"
            description="From requirement definition to deployment, our process ensures speed, accuracy, and accountability."
            light
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processSteps.map((step, index) => (
              <motion.div
                key={index}
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
              Ready to Scale Your Team Flexibly?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Let's discuss your contract staffing needs and build a flexible workforce that grows with your business.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/employers">
                  Start Hiring <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/contact">Get Free Consultation</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Contract;