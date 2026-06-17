import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Linkedin, 
  Facebook, 
  Instagram,
  ChevronRight,
  Building2,
  Users,
  BadgeCheck,
  Youtube
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import logo from "@/assets/logo.png";
import isoCert from "@/assets/iso-cert.png"; 

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Employers", href: "/employers" },
  { label: "Candidates", href: "/candidates" },
  { label: "Contact", href: "/contact" },
];

const services = [
  { label: "IT Recruitment", href: "/ITRecruitment" },
  { label: "Non-IT Recruitment", href: "/NonITRecruitment" },
  { label: "Permanent Staffing", href: "/StaffingModels" },
  { label: "Contract Staffing", href: "/contract" },
];

const socialLinks = [
  { icon: Linkedin, href: "https://www.linkedin.com/company/vagarious-solutions/", label: "LinkedIn" },
  { icon: Youtube, href: "https://youtube.com/@vagarioussolutions?si=MZmObPnUFxHLE20i", label: "Youtube" },
  { icon: Facebook, href: "https://www.facebook.com/share/188EdfiLRw/", label: "Facebook" },
  { icon: Instagram, href: "https://www.instagram.com/vagarioussolutions?igsh=d2I1dWo0Z3UwbzZy", label: "Instagram" },
];

const stats = [
  { value: "98%", label: "Client Satisfaction" },
  { value: "500+", label: "Companies Served" },
  { value: "10K+", label: "Placements Made" },
  { value: "24/7", label: "Support Available" },
];

const certifications = [
  { label: "MSME Registered" },
  { label: "Top IT Recruitment Agency 2024" },
  { label: "Best Startup Award 2023" },
];

export function Footer() {
  const [activeLink, setActiveLink] = useState<string | null>(null);

  return (
    <footer className="relative bg-[#f5f5f7] dark:bg-[#000000] text-[#1d1d1f] dark:text-[#f5f5f7] overflow-hidden">
      {/* Gradient Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-transparent dark:from-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-gradient-to-tr from-gray-400/5 to-transparent dark:from-gray-400/10 rounded-full blur-3xl" />
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]" style={{
          backgroundImage: `
            linear-gradient(to right, #1d1d1f 1px, transparent 1px),
            linear-gradient(to bottom, #1d1d1f 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* CTA Section - Reduced Padding */}
      <div className="container mx-auto max-w-7xl py-10 px-4 sm:px-6 lg:px-8 relative z-10 ">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative group"
        >
          {/* Background with subtle gradient */}
          <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-gray-50/80 to-gray-100/80 dark:from-gray-900/80 dark:to-gray-800/80 backdrop-blur-xl border border-gray-300/20 dark:border-gray-700/20 shadow-2xl shadow-black/5" />
          
          {/* Animated border */}
          <div className="absolute inset-0 rounded-[28px] bg-gradient-to-r from-transparent via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          {/* Content */}
          <div className="relative z-10 p-8 md:p-10">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-300/30 dark:border-gray-700/30"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ready for exceptional hiring
                </span>
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight"
              >
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">
                  Transform Your
                </span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
                  Recruitment Journey
                </span>
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
              >
                Experience the future of recruitment with precision-matched talent and innovative solutions.
              </motion.p>

              {/* Stats Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-6 border-t border-gray-300/20 dark:border-gray-700/20"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center pt-6"
              >
                <Button
                  size="lg"
                  className="group relative h-12 px-8 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                  asChild
                >
                  <Link to="/employers">
                    <span className="relative z-10 flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      <span>Hire Talent</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  </Link>
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="group h-12 px-8 rounded-full border-2 border-gray-400/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm hover:border-blue-500 hover:bg-blue-500/5 hover:scale-[1.02] transition-all duration-300"
                  asChild
                >
                  <Link to="/candidates">
                    <span className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      <span>Find Jobs</span>
                      <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </span>
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Footer Content - Compacted */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 relative z-10 ">
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12"> */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-0 lg:gap-0">
          {/* Logo & Company Info */}
          <div className="lg:col-span-2 space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img 
                    src={logo} 
                    alt="Vagarious Solutions" 
                    className="h-12 medium:h-12 w-auto"
                  />
                </div>
              </div>
              
              {/* <p className="text-sm text-gray-700 dark:text-gray-900 leading-relaxed max-w-md"> */}
              <p className="text-sm text-grey leading-relaxed max-w-md">
                We deliver innovative recruitment solutions that connect high-quality talent with forward-thinking organizations, enabling smarter and more strategic hiring.
              </p>
            </motion.div>

            {/* Social Links and ISO Certification */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-5"
            >
              <div className="space-y-3">
                <p className="text-sm font-smedium text-gray-700 dark:text-gray-300">
                {/* <p className="text-sm text-white leading-relaxed max-w-md"> */}
                  Connect with us
                </p>
                <div className="flex gap-2 sm:gap-3">
                  {socialLinks.map((social) => (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -2, scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300/30 dark:border-gray-700/30 flex items-center justify-center hover:border-blue-500/50 hover:shadow-md transition-all duration-300 group"
                      aria-label={social.label}
                    >
                    <social.icon className="w-3 h-3 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-500 transition-colors" />
                    {/* <social.icon className="w-3 h-3 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400 group-hover:text-red-500 transition-colors" /> */}

                    </motion.a>
                  ))}
                </div>
              </div>

              {/* ISO Certification Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="pt-4 border-t border-gray-300/20 dark:border-gray-700/20"
              >
                <div className="inline-block p-3 rounded-xl bg-white/70  backdrop-blur-sm border border-gray-300/30 dark:border-gray-700/30 hover:border-blue-500/30 transition-all duration-300 group">
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 flex-shrink-0">
                      <img 
                        src={isoCert} 
                        alt="ISO 9001:2015 Certified"
                        className="w-full h-full object-contain filter group-hover:brightness-110 transition-all duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-left">
                      {/* <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide"> */}
                      <p className="text-sm text-grey leading-relaxed max-w-md">
                        ISO 9001:2015
                      </p>
                      {/* <p className="text-medium text-gray-700 dark:text-gray-300 font-semibold mt-1"> */}
                      <p className="text-sm text-grey leading-relaxed max-w-md">
                        Quality Certified
                      </p>
                      {/* <p className="text-xs text-gray-500 dark:text-gray-400 mt-1"> */}
                      <p className="text-sm text-grey leading-relaxed max-w-md">
                        Excellence in Recruitment
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="space-y-4" 
          >
            <div className="flex items-center gap-3">
              {/* <div className="w-1.5 h-1.5 rounded-ful bg-blue-500" /> */}
              <h4 className="text-base font-semibold tracking-tight">
                Quick Links
              </h4>
            </div>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <motion.li
                  key={link.label}
                  onMouseEnter={() => setActiveLink(link.label)}
                  onMouseLeave={() => setActiveLink(null)}
                  whileHover={{ x: 4 }}
                  className="relative"
                >
                  <Link
                    to={link.href}
                    className="flex items-center justify-between py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors group"
                    // className="flex items-center justify-between py-1.5 text-white hover:text-gray-200 transition-colors group"
                  >
                    <span className="text-base font-medium tracking-wide">
                      {link.label}
                    </span>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-3 sm:w-4 h-[1px] bg-blue-500 mr-1" />
                      <ChevronRight className="w-2.5 h-2.5 text-blue-500" />
                    </div>
                  </Link>
                  {activeLink === link.label && (
                    <motion.div
                      layoutId="activeLink"
                      className="absolute left-0 right-0 bottom-0 h-[1px] bg-gradient-to-r from-blue-500/50 to-transparent"
                      transition={{ type: "spring", bounce: 0.2 }}
                    />
                  )}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            // className="space-y-4"
            className="space-y-4 max-w-[160px]"
          >
            <div className="flex items-center gap-3">
              {/* <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> */}
              <h4 className="text-base font-semibold tracking-tight">
                Our Services
              </h4>
            </div>
            <ul className="space-y-2">
              {services.map((service) => (
                <motion.li
                  key={service.label}
                  whileHover={{ x: 4 }}
                  className="relative"
                >
                  <Link
                    to={service.href}
                    className="flex items-center justify-between py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors group"
                    //  className="flex items-center justify-between py-1.5 text-white hover:text-gray-200 transition-colors group"
                  >
                    <span className="text-medium font-medium tracking-wide">
                      {service.label}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-2.5 h-2.5 text-blue-500" />
                    </div>
                  </Link>
                  <div className="absolute left-0 bottom-0 w-0 group-hover:w-full h-[1px] bg-gradient-to-r from-blue-500 to-transparent transition-all duration-300" />
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info - Optimized for UI */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            // className="space-y-4"
            className="space-y-4 max-w-[200px]"
          >
            <div className="flex items-center gap-3">
              {/* <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> */}
              <h4 className="text-base font-semibold tracking-tight">
                Contact Us
              </h4>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                  <MapPin className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-0.5">
                      {/* <p className="flex items-center justify-between py-1.5 text-white hover:text-gray-200 transition-colors group"> */}
                    Office Address
                  </p>
                  <p className="text-sm text-gray-800 dark:text-gray-400 leading-relaxed">
                   {/* <p className="flex items-center justify-between py-1.5 text-white hover:text-gray-200 transition-colors group"> */}
                    Ground Floor, Shanmukh Empire, 83, Ayyappa Society Main Road, Madhapur, Hyderabad, Telangana-500081
                  </p>
                </div>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                  <Phone className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-0.5">
                      {/* <p className="flex items-center justify-between py-1.5 text-white hover:text-gray-200 transition-colors group"> */}
                    Phone Numbers
                  </p>
                  <div className="flex flex-col gap-0.5">
                    <a href="tel:+916304244117" className="text-sm text-gray-800 dark:text-gray-400 hover:text-blue-600 transition-colors">
                    {/* <a href="tel:+916304244117"  className="flex items-center justify-between py-1.5 text-white hover:text-gray-200 transition-colors group"> */}
                      +91 6304244117
                    </a>
                    <a href="tel:+918919801095" className="text-sm text-gray-800 dark:text-gray-400 hover:text-blue-600 transition-colors">
                    {/* <a href="tel:+918919801095"  className="flex items-center justify-between py-1.5 text-white hover:text-gray-200 transition-colors group"> */}
                      +91 8919801095
                    </a>
                  </div>
                </div>
              </li>
              
              <li className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                  <Mail className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-0.5">
                   {/* <p className="flex items-center justify-between py-1.5 text-white hover:text-gray-200 transition-colors group"> */}
                    Email Address
                  </p>
                  <a href="mailto:ops@vagarioussolutions.com" className="text-sm text-gray-800 dark:text-gray-400 hover:text-blue-600 transition-colors break-all">
                  {/* <a href="mailto:ops@vagarioussolutions.com" className="flex items-center justify-between py-1.2 text-white hover:text-gray-200 transition-colors group"> */}
                    ops@vagarioussolutions.com
                  </a>
                </div>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Certifications & Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 pt-6 border-t border-gray-300/20 dark:border-gray-700/20"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BadgeCheck className="w-5 h-5 text-blue-500" />
              <span className="text-medium font-medium text-gray-900 dark:text-gray-300">
                Certified & Verified
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {certifications.map((cert, index) => (
                <motion.div
                  key={cert.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ y: -2 }}
                  className="px-4 py-1.5 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300/30 dark:border-gray-700/30 hover:border-blue-500/30 hover:shadow-md transition-all duration-300"
                >
                  <span className="text-xs sm:text-sm text-gray-800 dark:text-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {cert.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar - Reduced margin */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-6 sm:mt-8 pt-4 border-t border-gray-300/10 dark:border-gray-700/10"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-500 tracking-wide text-center md:text-left">
              © {new Date().getFullYear()} Vagarious Solutions Pvt Ltd. All rights reserved.
            </p>
          </div>
          
          <div className="mt-3 pt-2 border-t border-gray-300/5 dark:border-gray-700/5">
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent mx-auto" />
          </div>
        </motion.div>
      </div>

      {/* Back to top button */}
      <AnimatePresence>
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-300/30 dark:border-gray-700/30 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          aria-label="Back to top"
        >
          <div className="relative">
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400 -rotate-90 group-hover:text-blue-500 transition-colors" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </motion.button>
      </AnimatePresence>
    </footer>
  );
}