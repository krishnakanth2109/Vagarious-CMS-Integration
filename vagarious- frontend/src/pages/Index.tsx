import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Code2, 
  Users, 
  Building2, 
  TrendingUp,
  CheckCircle2,
  Briefcase,
  Target,
  Award,
  Clock,
  Shield,
  Zap,
  Globe,
  HeartHandshake,
  Laptop,
  Headphones,
  PieChart,
  Settings,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import heroHome from "@/assets/hero-home.png";
import heroAbout from "@/assets/hero-about.jpg";
import heroServices from "@/assets/hero-services.jpg";

const carouselSlides = [
  {
    image: heroHome,
    title: "Your Trusted IT & Non-IT Recruitment Partner",
    subtitle: "Welcome to Vagarious Solutions",
    description: "Connecting exceptional talent with outstanding opportunities. We specialize in end-to-end recruitment solutions that drive business success.",
  },
  {
    image: heroAbout,
    title: "Expert Staffing Solutions for Every Industry",
    subtitle: "Powering Your Growth",
    description: "From permanent placements to contract staffing, we deliver tailored recruitment strategies that meet your unique business needs.",
  },
  {
    image: heroServices,
    title: "Building Teams That Transform Businesses",
    subtitle: "Excellence in Recruitment",
    description: "With years of expertise and a vast talent network, we're your gateway to finding the perfect match for your organization.",
  },
];

const services = [
  {
    icon: Code2,
    title: "IT Recruitment",
    description: "Skilled software developers, QA engineers, DevOps specialists, and other technology professionals to build and scale your tech teams.",
    color: "from-primary to-sky-dark",
  },
  {
    icon: Users,
    title: "Non-IT Recruitment",
    description: "Experienced sales, marketing, HR, finance, and operations professionals across diverse industries.",
    color: "from-sky-dark to-navy-light",
  },
  {
    icon: Briefcase,
    title: "Permanent Staffing",
    description: "Hire dependable, long-term talent that strengthens your core team and supports sustained business growth.",
    color: "from-primary to-sky-dark",
  },
  {
    icon: Clock,
    title: "Contract Staffing",
    description: "Flexible workforce solutions tailored for project-based, short-term, and seasonal business requirements.",
    color: "from-sky-dark to-navy-light",
  },
];

const industries = [
  { icon: Laptop, name: "IT & Software" },
  { icon: Building2, name: "BFSI" },
  { icon: HeartHandshake, name: "Healthcare" },
  { icon: Settings, name: "Manufacturing" },
  { icon: PieChart, name: "Retail" },
  { icon: Headphones, name: "BPO" },
];

const stats = [
  { value: 1500, suffix: "+", label: "Placements Done" },
  { value: 200, suffix: "+", label: "Client Companies" },
  { value: 98, suffix: "%", label: "Client Satisfaction" },
  { value: 15, suffix: "+", label: "Years Experience" },
];

const whyChooseUs = [
  {
    icon: Target,
    title: "Domain Expertise",
    description: "Specialized recruitment expertise across IT and Non-IT industries.",
  },
  {
    icon: Zap,
    title: "Speed with Precision",
    description: "Faster hiring cycles driven by efficient processes and expert sourcing.",
  },
  {
    icon: Shield,
    title: "Uncompromised Quality",
    description: "Thorough candidate vetting to ensure consistent hiring excellence.",
  },
  {
    icon: Globe,
    title: "Nationwide Reach",
    description: "Strong presence and access to talent across India.",
  },
  {
    icon: Award,
    title: "Results You Can Trust",
    description: "A proven history of successful placements and long-term partnerships.",
  },
  {
    icon: HeartHandshake,
    title: "End-to-End Partnership",
    description: "Comprehensive support covering every stage of the hiring journey.",
  },
];

const testimonials = [
  {
    quote: "Vagarious Solutions transformed our hiring process. Their understanding of our tech requirements was exceptional, and they delivered top-notch candidates within our timeline.",
    author: "Rajesh Kumar",
    role: "CTO, Tech Solutions Inc.",
    rating: 5,
  },
  {
    quote: "We've been partnering with Vagarious for our non-IT hiring needs for over 3 years. Their consistency in delivering quality candidates is remarkable.",
    author: "Priya Sharma",
    role: "HR Director, Global Services Ltd.",
    rating: 5,
  },
  {
    quote: "The contract staffing solutions from Vagarious helped us scale our team quickly for a major project. Highly professional and responsive team.",
    author: "Anil Mehta",
    role: "Operations Head, FinServ Corp",
    rating: 5,
  },
];

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(nextSlide, 5000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, nextSlide]);

  return (
    <Layout>
      {/* Hero Carousel */}
      <section 
        className="relative min-h-screen flex items-center overflow-hidden"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
          >
            <img
              src={carouselSlides[currentSlide].image}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/80 to-secondary/30" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 container-custom section-padding pt-32">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl"
            >
              <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-4">
                {carouselSlides[currentSlide].subtitle}
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-primary-foreground mb-6 leading-tight">
                {carouselSlides[currentSlide].title}
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl">
                {carouselSlides[currentSlide].description}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/employers">
                    Hire Talent <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button variant="hero-outline" size="xl" asChild>
                  <Link to="/candidates">Find Jobs</Link>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Simple Carousel Indicators (without buttons) */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
            <div className="flex gap-2">
              {carouselSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "bg-primary w-8"
                      : "bg-primary-foreground/40 hover:bg-primary-foreground/60"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Stats Section */}
      <section className="relative -mt-16 z-20">
        <div className="container-custom px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 md:p-12"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold font-heading text-primary mb-2">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-muted-foreground font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="section-padding">
        <div className="container-custom">
          <SectionHeading
            subtitle="What We Offer"
            title="Comprehensive Recruitment Solutions"
            description="Covering IT and non-IT roles, we ensure accurate talent matching with speed and expertise."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card-hover p-6 group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold font-heading mb-2">{service.title}</h3>
                <p className="text-muted-foreground mb-4">{service.description}</p>
              
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button size="lg" asChild>
              <Link to="/services">
                Explore All Services <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <SectionHeading
            subtitle="Why Vagarious"
            title="Your Success is Our Priority"
            description="We don't just fill positions – we build lasting partnerships that drive growth and success for both companies and candidates."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChooseUs.map((item, index) => (
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

      {/* Industries We Serve */}
      <section className="section-padding">
        <div className="container-custom">
          <SectionHeading
            subtitle="Industries We Serve"
            title="Expertise Across Sectors"
            description="Our recruitment specialists have deep domain knowledge across multiple industries, ensuring the perfect fit for every role."
          />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {industries.map((industry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="glass-card-hover p-6 text-center group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent mx-auto mb-4 flex items-center justify-center group-hover:from-primary group-hover:to-sky-dark transition-all duration-300">
                  <industry.icon className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-semibold">{industry.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-secondary text-secondary-foreground">
        <div className="container-custom">
          <SectionHeading
            subtitle="Testimonials"
            title="What Our Clients Say"
            description="Hear from the companies and professionals who have experienced our commitment to excellence."
            light
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-secondary-foreground/5 rounded-2xl p-6 border border-secondary-foreground/10"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-secondary-foreground/80 mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-bold">{testimonial.author}</p>
                  <p className="text-sm text-secondary-foreground/60">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-6">
            {/* For Employers */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-sky-dark p-8 md:p-12"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <Building2 className="w-12 h-12 text-primary-foreground mb-4" />
                <h3 className="text-2xl md:text-3xl font-bold font-heading text-primary-foreground mb-4">
                  Looking to Hire Top Talent?
                </h3>
                <p className="text-primary-foreground/80 mb-6">
                  Submit your requirements and let our experts find the perfect candidates for your organization.
                </p>
                <ul className="space-y-2 mb-6">
                  {["Response Within 24 Hours", "Free Hiring Strategy Consultation", "Transparent, No-Obligation Quotation", "Personalized Account Support"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-primary-foreground/90">
                      <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button variant="hero-outline" size="lg" asChild>
                  <Link to="/employers">
                    Submit Requirements <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* For Candidates */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary to-navy-light p-8 md:p-12"
            >
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <TrendingUp className="w-12 h-12 text-primary-foreground mb-4" />
                <h3 className="text-2xl md:text-3xl font-bold font-heading text-primary-foreground mb-4">
                  Ready for Your Next Career Move?
                </h3>
                <p className="text-primary-foreground/80 mb-6">
                  Explore exciting job opportunities with top companies across IT and Non-IT sectors.
                </p>
                <ul className="space-y-2 mb-6">
                  {["Access to premium jobs", "Career guidance support", "Fast-track applications"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-primary-foreground/90">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  asChild
                >
                  <Link to="/candidates">
                    Browse Jobs <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;