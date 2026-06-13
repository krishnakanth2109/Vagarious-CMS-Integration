import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Code2, 
  Database, 
  Cloud, 
  Shield, 
  TestTube2,
  Cpu,
  Smartphone,
  Globe,
  Headphones,
  Network,
  Server,
  Terminal,
  Monitor,
  Zap,
  CheckCircle2,
  Users,
  BarChart,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { SectionHeading } from "@/components/shared/SectionHeading";
import heroIT from "@/assets/hero-about.jpg";

const technologies = [
  {
    category: "Programming Languages",
    items: ["JavaScript/TypeScript", "Python", "Java", "C#/.NET", "Go", "Ruby", "PHP", "Swift/Kotlin"]
  },
  {
    category: "Frontend Frameworks",
    items: ["React.js", "Angular", "Vue.js", "Next.js", "Svelte", "Tailwind CSS"]
  },
  {
    category: "Backend & Databases",
    items: ["Node.js", "Spring Boot", "Django", "PostgreSQL", "MongoDB", "Redis", "MySQL"]
  },
  {
    category: "Cloud & DevOps",
    items: ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "Jenkins"]
  }
];

const itRoles = [
  {
    icon: Code2,
    title: "Software Development",
    description: "Full-stack, frontend, and backend developers across all technologies and frameworks.",
    skills: ["Web Development", "Mobile Apps", "Desktop Applications", "API Development"],
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: TestTube2,
    title: "QA & Testing",
    description: "Quality assurance engineers, test automation specialists, and manual testers.",
    skills: ["Test Automation", "Performance Testing", "Security Testing", "Manual Testing"],
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Cloud,
    title: "DevOps & Cloud",
    description: "Cloud architects, DevOps engineers, and infrastructure specialists.",
    skills: ["CI/CD Pipelines", "Cloud Migration", "Infrastructure as Code", "Monitoring"],
    color: "from-orange-500 to-red-500"
  },
  {
    icon: Database,
    title: "Data & Analytics",
    description: "Data scientists, data engineers, BI analysts, and machine learning engineers.",
    skills: ["Data Pipelines", "Machine Learning", "Business Intelligence", "Big Data"],
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Shield,
    title: "Cybersecurity",
    description: "Security analysts, penetration testers, and security architects.",
    skills: ["Network Security", "Application Security", "Compliance", "Incident Response"],
    color: "from-yellow-500 to-amber-500"
  },
  {
    icon: Headphones,
    title: "IT Support & Infrastructure",
    description: "System administrators, network engineers, and help desk professionals.",
    skills: ["System Administration", "Network Management", "Technical Support", "Hardware"],
    color: "from-indigo-500 to-blue-500"
  }
];

const industries = [
  { name: "FinTech & Banking", count: "200+" },
  { name: "Healthcare IT", count: "150+" },
  { name: "E-commerce & Retail", count: "180+" },
  { name: "SaaS & Enterprise", count: "250+" },
  { name: "Gaming & Entertainment", count: "120+" },
  { name: "EdTech", count: "90+" }
];

const process = [
  { step: "01", title: "Technical Requirement Analysis", description: "Deep dive into your technical stack, project requirements, and team dynamics." },
  { step: "02", title: "Skill Mapping & Sourcing", description: "Identify and source candidates with precise technical skills and experience." },
  { step: "03", title: "Technical Screening", description: "Comprehensive technical interviews, coding tests, and skill assessments." },
  { step: "04", title: "Culture Fit Evaluation", description: "Assess candidate's alignment with your team culture and work methodology." },
  { step: "05", title: "Technical Challenge Review", description: "Review of coding challenges, project assignments, and technical evaluations." },
  { step: "06", title: "Offer & Onboarding Support", description: "Assist with technical onboarding, tool setup, and integration into your workflow." }
];

const ITRecruitment = () => {
  return (
    <Layout>
      <HeroBanner
        image={heroIT}
        subtitle="IT Recruitment"
        title="Tech Talent Solutions for Digital Transformation"
        description="Connect with elite software developers, cloud architects, data scientists, and IT professionals who can accelerate your digital journey and drive innovation."
      >
        <Button variant="hero" size="lg" asChild>
          <Link to="/employers">Hire IT Talent</Link>
        </Button>
        <Button variant="hero-outline" size="lg" asChild>
          <Link to="/contact">Schedule Tech Consultation</Link>
        </Button>
      </HeroBanner>

      {/* Technology Expertise */}
      <section className="section-padding scroll-mt-24">
        <div className="container-custom">
          <SectionHeading
            subtitle="Technology Expertise"
            title="Comprehensive Tech Stack Coverage"
            description="We recruit across the entire technology spectrum, from legacy systems to cutting-edge innovations."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {technologies.map((tech, index) => (
              <motion.div
                key={tech.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card-hover p-6"
              >
                <h3 className="text-lg font-bold font-heading mb-4 text-primary">
                  {tech.category}
                </h3>
                <ul className="space-y-2">
                  {tech.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-muted-foreground text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* IT Roles & Specializations */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <SectionHeading
            subtitle="IT Roles We Recruit"
            title="Comprehensive IT Talent Solutions"
            description="From entry-level developers to CTOs, we help you build complete technology teams."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itRoles.map((role, index) => (
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
                <div className="flex flex-wrap gap-2">
                  {role.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Served */}
      <section className="section-padding">
        <div className="container-custom">
          <SectionHeading
            subtitle="Industries Served"
            title="IT Talent Across Sectors"
            description="We understand the unique technology needs of different industries and provide tailored recruitment solutions."
          />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {industries.map((industry, index) => (
              <motion.div
                key={industry.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="text-center p-4 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors"
              >
                <div className="text-2xl font-bold text-primary mb-1">{industry.count}</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{industry.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recruitment Process */}
      <section className="section-padding bg-secondary text-secondary-foreground">
        <div className="container-custom">
          <SectionHeading
            subtitle="Our IT Recruitment Process"
            title="Technical Talent Acquisition Framework"
            description="A specialized process designed to identify, evaluate, and onboard top-tier technical talent."
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
                <span className="text-5xl font-bold font-heading text-primary/20 absolute top-4 right-4">
                  {step.step}
                </span>
                <h3 className="text-lg font-bold font-heading mb-2 relative z-10">{step.title}</h3>
                <p className="text-secondary-foreground/70 relative z-10">{step.description}</p>
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
              Ready to Build Your Tech Dream Team?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Let's discuss your technical hiring needs and find the perfect talent match for your projects.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/employers">
                  Hire IT Professionals <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/contact">Get Technical Assessment</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default ITRecruitment;