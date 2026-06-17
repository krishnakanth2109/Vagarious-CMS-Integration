import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  UserPlus,
  Clock,
  UsersRound,
  Building2,
  Calendar,
  DollarSign,
  Shield,
  CheckCircle2,
  Zap,
  Target,
  BarChart,
  FileText,
  Briefcase,
  Users,
  Globe,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { SectionHeading } from "@/components/shared/SectionHeading";
import heroStaffing from "@/assets/hero-about.jpg";

const staffingModels = [
  {
    icon: UserPlus,
    title: "Permanent Staffing (IT & Non-IT)",
    duration: "Long-Term Talent Solutions",
    description: "We help organizations hire full-time IT and Non-IT professionals aligned with technical needs, business goals, and company culture.",
    benefits: [
      "Comprehensive screening and background checks",
      "Role-specific technical and functional assessments",
      "Cultural and behavioral fit evaluation",
      "Compensation and offer support",
      "Focus on long-term retention"
    ],
    bestFor: ["Core IT and key Non-IT roles", "Leadership and senior positions", "Business-critical and growth roles"],
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Clock,
    title: "Contract Staffing",
    duration: "Flexible Workforce Solutions",
    description: "On-demand professionals to support projects, short-term requirements, and specialized needs.",
    benefits: [
      "Rapid deployment within defined timelines",
      "Flexible engagement models",
      "End-to-end payroll management",
      "Easy role extension or conversion",
      "Reduced operational overhead"
    ],
    bestFor: ["Project-based assignments", "Seasonal workforce demands", "Niche or specialized skill requirements", "Short-term business needs"],
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: UsersRound,
    title: "Bulk Hiring",
    duration: "High-Volume Recruitment Solutions",
    description: "Efficient large-scale hiring for organizations with multi-location and mass recruitment needs.",
    benefits: [
      "Dedicated recruitment teams",
      "Campus and walk-in hiring drives",
      "Centralized assessments and screening",
      "Multi-location hiring coordination",
      "Consistent and standardized evaluation"
    ],
    bestFor: ["New project rollouts", "Business expansion initiatives", "Seasonal workforce requirements", "Graduate and entry-level programs"],
    color: "from-orange-500 to-red-500"
  },
  {
    icon: Building2,
    title: "Executive Search",
    duration: "Strategic Leadership Hiring",
    description: "Confidential headhunting for CXO and senior leadership roles that shape business direction.",
    benefits: [
      "Discreet search and evaluation",
      "Leadership and competency assessment",
      "Market mapping and references",
      "Succession planning support"
      
    ],
    bestFor: ["C-suite and senior executives", "Board and leadership roles", "Continuity and succession needs"],
    color: "from-green-500 to-emerald-500"
  }
];

const comparison = {
  permanent: {
    commitment: "Long-term",
    cost: "Higher initial, lower long-term",
    flexibility: "Low",
    onboarding: "Comprehensive",
    idealFor: "Core business functions"
  },
  contract: {
    commitment: "Short-term",
    cost: "Lower initial, pay-as-you-go",
    flexibility: "High",
    onboarding: "Rapid",
    idealFor: "Project-based needs"
  },
  bulk: {
    commitment: "Mass hiring",
    cost: "Economies of scale",
    flexibility: "Medium",
    onboarding: "Batch processing",
    idealFor: "Expansion phases"
  },
  executive: {
    commitment: "Strategic",
    cost: "Premium",
    flexibility: "Custom",
    onboarding: "Strategic integration",
    idealFor: "Leadership roles"
  }
};

const process = [
  { 
    step: "01", 
    title: "Model Selection", 
    description: "Assess business requirements and identify the most effective staffing approach.",
    icon: Target 
  },
  { 
    step: "02", 
    title: "Strategy Design", 
    description: "Develop a tailored recruitment strategy aligned with the selected model.",
    icon: BarChart 
  },
  { 
    step: "03", 
    title: "Talent Pipeline Development", 
    description: "Build and manage a continuous pipeline of qualified and role-ready candidates.",
    icon: Users 
  },
  { 
    step: "04", 
    title: "Evaluation Framework", 
    description: "Apply role-specific and model-based assessment methodologies.",
    icon: FileText 
  },
  { 
    step: "05", 
    title: "Deployment & Placement", 
    description: "Execute hiring and ensure timely candidate onboarding.",
    icon: Zap 
  },
  { 
    step: "06", 
    title: "Performance Monitoring", 
    description: "Track outcomes and optimize recruitment effectiveness over time.",
    icon: TrendingUp 
  }
];

const benefits = [
  {
    title: "Cost Optimization",
    description: "Access hiring models that help manage recruitment costs effectively while maintaining quality."
  },
  {
    title: "Flexibility & Scalability",
    description: "Adapt workforce size quickly in response to changing business demands."
  },
  {
    title: "Risk Mitigation",
    description: "Minimize hiring and compliance risks through proven processes and structured engagement models."
  },
  {
    title: "Speed to Market",
    description: " Reduce time-to-hire with streamlined, role-specific recruitment workflows."
  }
];

const StaffingModels = () => {
  return (
    <Layout>
      <HeroBanner
        image={heroStaffing}
        subtitle="Staffing Models"
        title="Flexible Workforce Solutions"
        description="Choose from our comprehensive range of staffing models designed to meet your specific business needs, budget constraints, and growth objectives."
      >
    
      </HeroBanner>

      {/* Staffing Models */}
      <section className="section-padding scroll-mt-24">
        <div className="container-custom">
          <SectionHeading
            subtitle="Our Models"
            title="Integrated Staffing Solutions"
            description="Flexible hiring approaches designed to support your organizational objectives and growth plans."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {staffingModels.map((model, index) => (
              <motion.div
                key={model.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card overflow-hidden"
              >
                <div className={`h-2 bg-gradient-to-r ${model.color}`} />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${model.color} flex items-center justify-center`}>
                        <model.icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold font-heading">{model.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-muted-foreground">{model.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-6">{model.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-sm text-primary mb-3">Key Benefits</h4>
                      <ul className="space-y-2">
                        {model.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-sm text-primary mb-3">Best For</h4>
                      <ul className="space-y-2">
                        {model.bestFor.map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <SectionHeading
            subtitle="Strategic Advantages"
            title="Why Our Staffing Models Deliver Results"
            description="Our structured staffing solutions are designed to meet the evolving needs of modern organizations, offering efficiency, control, and measurable outcomes."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card-hover p-6 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold font-heading mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section-padding">
        <div className="container-custom">
          <SectionHeading
            subtitle="Implementation Process"
            title="Model-Driven Recruitment Framework"
            description="A structured and outcome-focused approach to deploying the most suitable staffing model for your organization."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {process.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card-hover p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-3xl font-bold font-heading text-primary/30">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold font-heading mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-secondary text-secondary-foreground">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
              Need Help Choosing the Right Model?
            </h2>
            <p className="text-secondary-foreground/70 text-lg mb-8 max-w-2xl mx-auto">
              Our experts can analyze your requirements and recommend the optimal staffing solution for your business.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" asChild>
              
              </Button>
            
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default StaffingModels;