import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Code2, 
  Database, 
  Cloud, 
  Server,
  Terminal,
  Monitor,
  Smartphone,
  Globe,
  Layers,
  Box,
  GitBranch,
  TestTube2,
  CheckCircle2,
  Users,
  Briefcase,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { SectionHeading } from "@/components/shared/SectionHeading";

// UNCOMMENT THIS LINE when you have the image in your assets folder:
// import heroIT from "@/assets/hero-about copy.jpg";

const developmentServices = [
  {
    icon: Globe,
    title: "Web Development",
    description: "Custom web applications built with modern frameworks and best practices.",
    technologies: [],
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Smartphone,
    title: "Mobile Development",
    description: "Native and cross-platform mobile applications for iOS and Android.",
    technologies: [],
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Server,
    title: "Backend Development",
    description: "Robust server-side applications and APIs for scalable solutions.",
    technologies: [],
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Database,
    title: "Database Design",
    description: "Efficient database architecture and optimization for data-intensive applications.",
    technologies: [],
    color: "from-orange-500 to-red-500"
  },
  {
    icon: Cloud,
    title: "Cloud Solutions",
    description: "Cloud-native development and migration services for modern infrastructure.",
    technologies: [],
    color: "from-indigo-500 to-blue-500"
  },
  {
    icon: TestTube2,
    title: "QA & Testing",
    description: "Comprehensive testing services to ensure software quality and reliability.",
    technologies: [],
    color: "from-teal-500 to-cyan-500"
  }
];

const technologies = [
  {
    category: "Frontend",
    items: ["React.js", "TypeScript", "Next.js", "Vue.js", "Angular", "Tailwind CSS"]
  },
  {
    category: "Backend",
    items: ["Node.js", "Python", "Java", "Go", "C#/.NET", "Ruby"]
  },
  {
    category: "Mobile",
    items: ["React Native", "Flutter", "Swift", "Kotlin", "Ionic"]
  },
  {
    category: "Cloud & DevOps",
    items: ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform"]
  }
];

const developmentProcess = [
  { step: "01", title: "Requirements Analysis", description: "Understanding your business needs, technical requirements, and project goals." },
  { step: "02", title: "Architecture Design", description: "Creating scalable architecture and selecting optimal technology stack." },
  { step: "03", title: "Agile Development", description: "Iterative development with regular sprints and continuous feedback." },
  { step: "04", title: "Quality Assurance", description: "Rigorous testing at every stage to ensure bug-free delivery." },
  { step: "05", title: "Deployment", description: "Smooth deployment to production with zero downtime." },
  { step: "06", title: "Support & Maintenance", description: "Ongoing support, updates, and performance optimization." }
];

const SoftwareDevelopment = () => {
  return (
    <Layout>
      <HeroBanner
        // image={heroIT} // <-- UNCOMMENT THIS LINE when you uncomment the import above
        subtitle="Software Development"
        title="Custom Software Solutions for Your Business"
        description="Build scalable, secure, and high-performance software applications with our expert development team. From web apps to enterprise solutions, we bring your vision to life."
        >
        <Button variant="hero" size="lg" asChild>
          <Link to="/employers">Get a Quote</Link>
        </Button>
        <Button variant="hero-outline" size="lg" asChild>
          <Link to="/contact">Schedule Consultation</Link>
        </Button>
      </HeroBanner>

      {/* Development Services */}
      <section className="section-padding scroll-mt-24">
        <div className="container-custom">
          <SectionHeading
            subtitle="Our Services"
            title="Comprehensive Software Development"
            description="End-to-end development services tailored to your business requirements and technology goals."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {developmentServices.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card-hover p-6"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4`}>
                  <service.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold font-heading mb-2">{service.title}</h3>
                <p className="text-muted-foreground mb-4 text-sm">{service.description}</p>
                <div className="flex flex-wrap gap-2">
                  {service.technologies.map((tech, i) => (
                    <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <SectionHeading
            subtitle="Technology Stack"
            title="Modern Technologies We Use"
            description="We leverage cutting-edge technologies to build robust and scalable solutions."
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

      {/* Development Process */}
      <section className="section-padding">
        <div className="container-custom">
          <SectionHeading
            subtitle="Our Process"
            title="Software Development Lifecycle"
            description="A proven methodology ensuring successful project delivery every time."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {developmentProcess.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-5xl font-bold font-heading text-blue-100 dark:text-blue-900/30 absolute top-4 right-4">
                  {step.step}
                </span>
                <h3 className="text-lg font-bold font-heading mb-2 relative z-10">{step.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 relative z-10">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-blue-50 dark:bg-blue-900/20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
              Ready to Build Your Custom Software?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Let's discuss your project requirements and create a tailored solution for your business.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/employers">
                  Get Started <ArrowRight className="w-5 h-5" />
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

export default SoftwareDevelopment;