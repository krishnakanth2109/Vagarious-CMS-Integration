import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Target, 
  Eye, 
  Heart, 
  Users, 
  Award, 
  TrendingUp,
  CheckCircle2,
  Lightbulb,
  Handshake,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import heroAbout from "@/assets/hero-about.jpg";

const values = [
  {
    icon: Heart,
    title: "Integrity",
    description: "We work with honesty, fairness, and openness in all interactions with clients and candidates.",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "We focus on delivering consistent quality by carefully matching the right people to the right roles.",
  },
  {
    icon: Users,
    title: "Partnership",
    description: "We believe in building long-term relationships based on trust, collaboration, and mutual respect.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We continuously improve our hiring approaches by adapting to new methods and tools.",
  },
  {
    icon: Globe,
    title: "Diversity",
    description: "We support inclusive hiring practices and value different skills, experiences, and perspectives.",
  },
  {
    icon: Handshake,
    title: "Commitment",
    description: "We stay dedicated to our responsibilities and strive to deliver dependable recruitment solutions every time.",
  },
];

const timeline = [
  {
    year: "2019",
    title: "The Foundation",
    description: "Vagarious Solutions was established with a clear focus on simplifying recruitment through a people-first and quality-driven approach.",
  },
  {
    year: "2020",
    title: "Business Expansion",
    description: "Our operations expanded to key metropolitan cities, strengthening our presence in major hiring markets such as Bangalore, Mumbai, and Delhi.",
  },
  {
    year: "2021",
    title: "Focus on IT Hiring",
    description: "To meet increasing demand in the technology sector, we introduced a dedicated IT recruitment practice to support evolving business needs.",
  },
  {
    year: "2022",
    title: "Placement Milestone",
    description: "We successfully crossed 1,000+ placements and partnered with over 150 organizations, reflecting growing trust from clients across industries.",
  },
  {
    year: "2024 - 2025",
    title: "Pan-India Growth",
    description: "With an expanded service portfolio, we now support clients across major cities in India, continuing to grow alongside our partners and candidates.",
  },
];

const team = [
  { name: "Founder & CEO", count: 2 },
  { name: "IT Recruiters", count: 25 },
  { name: "Non-IT Recruiters", count: 20 },
  { name: "Client Relations", count: 70 },
  { name: "Operations Team", count: 10 },
];

const About = () => {
  return (
    <Layout>
      <HeroBanner
        image={heroAbout}
        subtitle="About Vagarious Solutions"
        title="Building Bridges Between Talent & Opportunity"
        description="For over a decade, we've been the trusted recruitment partner for businesses across India, helping them find exceptional talent that drives success."
      >
        <Button variant="hero" size="lg" asChild>
          <Link to="/employers">Partner With Us</Link>
        </Button>
        <Button variant="hero-outline" size="lg" asChild>
          <Link to="/contact">Get in Touch</Link>
        </Button>
      </HeroBanner>

      {/* Who We Are */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">
                Who We Are
              </p>
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">
                Your Partner in Building Strong Teams
              </h2>
              <div className="space-y-4 text-muted-foreground text-justify">
                <p>
                  Vagarious Solutions Pvt. Ltd. is a recruitment and staffing firm based in Hyderabad, supporting organizations across both IT and Non-IT domains. We work closely with businesses to help them find the right people who contribute to long-term success.

                </p>
                <p>
                  Our team brings practical hiring experience and a clear understanding of today’s workforce needs. By using reliable sourcing methods and structured screening processes, we connect employers with candidates who are not only qualified but also a good fit for the company’s work culture.

                </p>
                <p>
                  We believe recruitment is more than filling positions—it’s about understanding people and business goals. That’s why we take the time to learn about your organization, expectations, and future plans, enabling us to recommend candidates who can grow with your team and add real value

                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild>
                  <Link to="/services">
                    Our Services <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { value: 15, suffix: "+", label: "Years Experience" },
                { value: 1500, suffix: "+", label: "Placements" },
                { value: 200, suffix: "+", label: "Clients" },
                { value: 70, suffix: "+", label: "Team Members" },
              ].map((stat, index) => (
                <div key={index} className="glass-card p-6 text-center">
                  <div className="text-3xl md:text-4xl font-bold font-heading text-primary mb-1">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-sky-dark flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold font-heading mb-4">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To be a reliable recruitment partner for organizations by providing thoughtful and effective hiring solutions. We aim to understand the specific needs of each business and connect them with professionals who support long-term growth and success. Our focus is on creating value for both employers and candidates through honest, efficient, and people-centric recruitment practices.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass-card p-8"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-dark to-navy-light flex items-center justify-center mb-6">
                <Eye className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold font-heading mb-4">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To grow as a trusted recruitment consulting firm in Pan India, known for delivering quality hiring solutions and building strong relationships with clients and candidates. We aim to create a future where organizations easily find the right talent to support their goals, and professionals discover opportunities that match their skills and career aspirations.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="section-padding">
        <div className="container-custom">
          <SectionHeading
            subtitle="Our Core Values"
            title="The Principles That Guide Our Work"
            description="Our values define how we operate and interact with clients, candidates, and partners. They guide our approach to recruitment, decision-making, and long-term relationships, ensuring we deliver consistent and dependable outcomes."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card-hover p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-heading mb-2">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Journey */}
      <section className="section-padding bg-secondary text-secondary-foreground">
        <div className="container-custom">
          <SectionHeading
            
            title="Our Journey"
            light
            description=" A journey of steady growth, built on trust, consistency, and a strong commitment to delivering quality recruitment solutions."
          />

          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 hidden md:block" />
            {timeline.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex items-center gap-8 mb-8 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                  <div className="bg-secondary-foreground/5 rounded-2xl p-6 border border-secondary-foreground/10">
                    <span className="text-primary font-bold text-lg">{item.year}</span>
                    <h3 className="text-xl font-bold font-heading mt-2 mb-2">{item.title}</h3>
                    <p className="text-secondary-foreground/70">{item.description}</p>
                  </div>
                </div>
                <div className="hidden md:flex w-12 h-12 rounded-full bg-primary items-center justify-center flex-shrink-0 z-10">
                  <CheckCircle2 className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why We Exist */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">
                Why We Exist
              </p>
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">
                Addressing Hiring Challenges
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">The Challenge</h4>
                    <p className="text-muted-foreground">
                      Many organizations find it difficult to identify the right talent within the required time, while professionals often struggle to find roles that align with their skills, experience, and career goals.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Handshake className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Our Approach</h4>
                    <p className="text-muted-foreground">
                      We act as a connecting partner by understanding both business needs and candidate expectations. Through our network, market knowledge, and structured hiring process, we help create meaningful matches that support long-term growth for companies and professionals alike.

                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8"
            >
              <h3 className="text-xl font-bold font-heading mb-6">Our Team Composition</h3>
              <div className="space-y-4">
                {team.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{item.name}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(item.count / 30) * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className="h-full bg-gradient-to-r from-primary to-sky-dark rounded-full"
                        />
                      </div>
                      <span className="font-bold text-primary w-8">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="font-bold">Total Team Strength</span>
                  <span className="text-2xl font-bold text-primary">
                    <AnimatedCounter end={127} suffix="+" />
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
