import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Moon, Sun, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

// Import social media icons
import { 
  Instagram, 
  Facebook, 
  Linkedin, 
  Youtube, 
  MessageCircle
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  {
    label: "Services",
    href: "/services",
    children: [
      { label: "IT Recruitment", href: "/ITRecruitment" },
      { label: "Non-IT Recruitment", href: "/NonITRecruitment" },
      { label: "Staffing Models", href: "/StaffingModels" },
      { label: "Contract Staffing", href: "/contract" },
      { label: "Software Development", href: "/software-development" }, // Added new route here
    ],
  },
  { label: "Employers", href: "/employers" },
  { label: "Candidates", href: "/candidates" },
  { label: "Contact", href: "/contact" },
];

// Social media links
const socialMediaLinks = [
  {
    icon: Linkedin,
    href: "https://www.linkedin.com/company/vagarious-solutions/",
    label: "LinkedIn",
    lightColor: "bg-blue-600 hover:bg-blue-700",
    darkColor: "bg-blue-500 hover:bg-blue-600",
    iconColor: "text-white",
    hoverClass: "hover:shadow-blue-500/30 hover:-translate-y-1"
  },
  {
    icon: Instagram,
    href: "https://www.instagram.com/vagarioussolutions?igsh=d2I1dWo0Z3UwbzZy",
    label: "Instagram",
    lightColor: "bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700",
    darkColor: "bg-gradient-to-br from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600",
    iconColor: "text-white",
    hoverClass: "hover:shadow-pink-500/30 hover:-translate-y-1"
  },
  {
    icon: Facebook,
    href: "https://www.facebook.com/share/188EdfiLRw/",
    label: "Facebook",
    lightColor: "bg-blue-700 hover:bg-blue-800",
    darkColor: "bg-blue-600 hover:bg-blue-700",
    iconColor: "text-white",
    hoverClass: "hover:shadow-blue-500/30 hover:-translate-y-1"
  },
  {
    icon: Youtube,
    href: "https://youtube.com/@vagarioussolutions?si=MZmObPnUFxHLE20i",
    label: "YouTube",
    lightColor: "bg-red-600 hover:bg-red-700",
    darkColor: "bg-red-500 hover:bg-red-600",
    iconColor: "text-white",
    hoverClass: "hover:shadow-red-500/30 hover:-translate-y-1"
  },
  {
    icon: MessageCircle,
    href: "https://wa.me/8919801095",
    label: "WhatsApp",
    lightColor: "bg-green-600 hover:bg-green-700",
    darkColor: "bg-green-500 hover:bg-green-600",
    iconColor: "text-white",
    hoverClass: "hover:shadow-green-500/30 hover:-translate-y-1"
  }
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark(!isDark);
  };

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  const handleSocialClick = (href: string) => {
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.nav
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-800 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container-custom h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <motion.img 
            src={logo} 
            alt="Vagarious Solutions" 
            className="h-16 w-auto"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const active = isActive(item.href);

            return (
              <div
                key={item.label}
                className="relative group"
                onMouseEnter={() => item.children && setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  to={item.href}
                  className={`
                    relative px-4 py-3 text-sm font-semibold tracking-wide
                    transition-all duration-300 flex items-center gap-1.5
                    ${
                      scrolled
                        ? active
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-800 dark:text-gray-200"
                        : active
                          ? "text-white"
                          : "text-white/90"
                    }
                  `}
                >
                  {/* Enhanced animated text with gradient */}
                  <span className={`relative z-10 transition-all duration-500 ${
                    scrolled 
                      ? active
                        ? "bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text"
                        : "text-gray-800 dark:text-gray-200 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-600 dark:group-hover:from-blue-400 dark:group-hover:to-cyan-400 group-hover:bg-clip-text group-hover:text-transparent"
                      : active
                        ? "text-white"
                        : "group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-blue-200 group-hover:bg-clip-text group-hover:text-transparent"
                  }`}>
                    {item.label}
                  </span>

                  {/* Animated arrow for dropdown */}
                  {item.children && (
                    <motion.div
                      animate={{ rotate: activeDropdown === item.label ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className={`w-3 h-3 transition-all duration-300 ${
                        scrolled 
                          ? active
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                          : "text-white/70 group-hover:text-white"
                      }`} />
                    </motion.div>
                  )}

                  {/* Enhanced animated underline effect */}
                  <motion.div
                    className={`
                      absolute left-1/2 -translate-x-1/2 -bottom-[2px]
                      h-[3px] rounded-full ${
                        scrolled
                          ? active
                            ? "bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 dark:from-blue-400 dark:via-cyan-300 dark:to-blue-400"
                            : "bg-gradient-to-r from-transparent via-blue-500/0 to-transparent group-hover:from-blue-600 group-hover:via-cyan-500 group-hover:to-blue-600 dark:group-hover:from-blue-400 dark:group-hover:via-cyan-300 dark:group-hover:to-blue-400"
                          : active
                            ? "bg-gradient-to-r from-white via-blue-200 to-white"
                            : "bg-gradient-to-r from-transparent via-white/0 to-transparent group-hover:from-white group-hover:via-blue-200 group-hover:to-white"
                      }
                    `}
                    initial={{ width: 0 }}
                    animate={{ width: active ? "80%" : "0%" }}
                    whileHover={{ width: "80%" }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  />

                  {/* Enhanced glow effect on hover */}
                  <motion.div
                    className={`
                      absolute inset-0 rounded-xl opacity-0 -z-10
                      transition-all duration-500 ${
                        scrolled
                          ? "group-hover:opacity-100 group-hover:bg-gradient-to-r group-hover:from-blue-100/60 group-hover:to-cyan-100/60 dark:group-hover:from-blue-900/30 dark:group-hover:to-cyan-900/30"
                          : "group-hover:opacity-100 group-hover:bg-gradient-to-r group-hover:from-white/20 group-hover:to-blue-100/20"
                      }
                    `}
                    initial={false}
                    whileHover={{ scale: 1.05 }}
                  />

                  {/* Enhanced shadow effect on hover */}
                  <motion.div
                    className={`
                      absolute inset-0 rounded-xl opacity-0 -z-20 blur-xl
                      transition-all duration-500 ${
                        scrolled
                          ? "group-hover:opacity-80 group-hover:bg-gradient-to-r group-hover:from-blue-500/30 group-hover:to-cyan-500/30 dark:group-hover:from-blue-400/20 dark:group-hover:to-cyan-400/20"
                          : "group-hover:opacity-80 group-hover:bg-gradient-to-r group-hover:from-white/30 group-hover:to-blue-200/30"
                      }
                    `}
                    initial={false}
                    whileHover={{ scale: 1.1 }}
                  />

                  {/* Enhanced pulse effect for active items */}
                  {active && (
                    <motion.div
                      className={`absolute inset-0 rounded-xl -z-10 ${
                        scrolled
                          ? "bg-gradient-to-r from-blue-100/20 to-cyan-100/20 dark:from-blue-900/10 dark:to-cyan-900/10"
                          : "bg-gradient-to-r from-white/10 to-blue-100/10"
                      }`}
                      animate={{
                        opacity: [0.3, 0.5, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}
                </Link>

                {/* Dropdown */}
                <AnimatePresence>
                  {item.children && activeDropdown === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute top-full left-0 mt-2 w-64 z-50" // Increased width to fit longer text
                    >
                      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div className="p-2">
                          {item.children.map((child, index) => (
                            <motion.div
                              key={child.label}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: index * 0.05 }}
                              whileHover={{ x: 5 }}
                            >
                              <Link
                                to={child.href}
                                className="group/dropdown-item flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-900/30 dark:hover:to-cyan-900/30 transition-all duration-300"
                                onClick={() => {
                                  setActiveDropdown(null);
                                  setIsOpen(false);
                                }}
                              >
                                <div className="relative">
                                  <motion.div
                                    className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                  />
                                  <motion.div
                                    className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 opacity-0 group-hover/dropdown-item:opacity-30 blur-sm transition-opacity duration-300"
                                    initial={false}
                                  />
                                </div>
                                <span className="font-medium text-gray-700 dark:text-gray-300 group-hover/dropdown-item:text-blue-600 dark:group-hover/dropdown-item:text-blue-400 transition-all duration-300 group-hover/dropdown-item:font-semibold">
                                  {child.label}
                                </span>
                                <motion.div
                                  className="ml-auto opacity-0 group-hover/dropdown-item:opacity-100 transition-all duration-300"
                                  initial={false}
                                >
                                  <ChevronDown className="w-3 h-3 rotate-90 text-blue-600 dark:text-blue-400" />
                                </motion.div>
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Right Side - Social Media & Dark Mode */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className={`rounded-full group/toggle ${
              scrolled
                ? "hover:bg-gradient-to-r hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-900/30 dark:hover:to-cyan-900/30 hover:text-blue-600 dark:hover:text-blue-400"
                : "hover:bg-gradient-to-r hover:from-white/20 hover:to-blue-100/20 hover:text-white"
            }`}
          >
            <motion.div
              whileHover={{ rotate: 30, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {isDark ? (
                <Sun className={`w-5 h-5 ${
                  scrolled 
                    ? "text-yellow-400 group-hover/toggle:text-yellow-500" 
                    : "text-yellow-300 group-hover/toggle:text-yellow-400"
                }`} />
              ) : (
                <Moon className={`w-5 h-5 ${
                  scrolled 
                    ? "text-gray-700 group-hover/toggle:text-blue-600" 
                    : "text-white/90 group-hover/toggle:text-white"
                }`} />
              )}
            </motion.div>
            <motion.div
              className="absolute inset-0 rounded-full opacity-0 group-hover/toggle:opacity-100 -z-10 blur-md transition-opacity duration-300"
              initial={false}
            >
              <div className={`absolute inset-0 rounded-full ${
                scrolled
                  ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20"
                  : "bg-gradient-to-r from-white/20 to-blue-200/20"
              }`} />
            </motion.div>
          </Button>

          {/* Social Media Icons */}
          <div className={`flex items-center gap-2 ${
            scrolled 
              ? "border-l border-gray-200 dark:border-gray-800 pl-3 ml-2" 
              : "pl-2"
          }`}>
            {socialMediaLinks.map((social, index) => (
              <motion.div
                key={social.label}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-full p-2 ${social.hoverClass} transition-all duration-300 group/social ${
                    isDark ? social.darkColor : social.lightColor
                  }`}
                  onClick={() => handleSocialClick(social.href)}
                  aria-label={social.label}
                >
                  <social.icon className={`w-4 h-4 ${social.iconColor} transition-transform duration-300 group-hover/social:scale-110`} />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex lg:hidden items-center gap-3">
          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className={`rounded-full ${
              scrolled
                ? "hover:bg-gradient-to-r hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-900/30 dark:hover:to-cyan-900/30 hover:text-blue-600 dark:hover:text-blue-400"
                : "hover:bg-gradient-to-r hover:from-white/20 hover:to-blue-100/20 hover:text-white"
            }`}
          >
            {isDark ? (
              <Sun className={`w-5 h-5 ${scrolled ? "text-yellow-400" : "text-yellow-300"}`} />
            ) : (
              <Moon className={`w-5 h-5 ${scrolled ? "text-gray-700" : "text-white/90"}`} />
            )}
          </Button>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="relative group/menu"
          >
            <div className={`absolute inset-0 rounded-lg opacity-0 group-hover/menu:opacity-100 transition-all duration-300 ${
              scrolled 
                ? "bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10" 
                : "bg-gradient-to-r from-white/10 via-blue-200/10 to-white/10"
            }`} />
            <motion.div
              animate={isOpen ? { rotate: 90 } : { rotate: 0 }}
              transition={{ duration: 0.3 }}
            >
              {isOpen ? (
                <X className={`w-6 h-6 ${scrolled ? "text-blue-600 dark:text-blue-400" : "text-white"}`} />
              ) : (
                <Menu className={`w-6 h-6 ${scrolled ? "text-gray-700 dark:text-gray-300" : "text-white/90"}`} />
              )}
            </motion.div>
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 shadow-2xl"
          >
            <div className="container-custom py-6 space-y-2">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 5 }}
                >
                  <Link
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`group/mobile-item block px-4 py-3 rounded-lg font-semibold tracking-wide transition-all duration-300
                    ${
                      isActive(item.href)
                        ? "text-blue-600 dark:text-blue-400 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30"
                        : "text-gray-800 dark:text-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-900/30 dark:hover:to-cyan-900/30 hover:text-blue-600 dark:hover:text-blue-400"
                    }`}
                  >
                    <span className="relative z-10 transition-all duration-300 group-hover/mobile-item:bg-gradient-to-r group-hover/mobile-item:from-blue-600 group-hover/mobile-item:to-cyan-600 dark:group-hover/mobile-item:from-blue-400 dark:group-hover/mobile-item:to-cyan-400 group-hover/mobile-item:bg-clip-text group-hover/mobile-item:text-transparent">
                      {item.label}
                    </span>
                    <motion.div
                      className="absolute left-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 rounded-full"
                      initial={{ width: 0 }}
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>

                  {item.children && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="ml-6 mt-1 space-y-1 border-l border-gray-200 dark:border-gray-700 pl-4"
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          to={child.href}
                          onClick={() => setIsOpen(false)}
                          className="group/mobile-child block px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
                        >
                          <span className="flex items-center gap-2">
                            <motion.div
                              className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 opacity-0 group-hover/mobile-child:opacity-100 transition-opacity duration-300"
                              initial={false}
                            />
                            {child.label}
                          </span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              ))}

              {/* Mobile Social Media Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="pt-6 border-t border-gray-200 dark:border-gray-800 mt-4"
              >
              
                <div className="flex items-center justify-center gap-3">
                  {socialMediaLinks.map((social, index) => (
                    <motion.div
                      key={social.label}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`rounded-full p-2 ${social.hoverClass} transition-all duration-300 group/social ${
                          isDark ? social.darkColor : social.lightColor
                        }`}
                        onClick={() => {
                          handleSocialClick(social.href);
                          setIsOpen(false);
                        }}
                        aria-label={social.label}
                      >
                        <social.icon className={`w-4 h-4 ${social.iconColor} transition-transform duration-300 group-hover/social:scale-110`} />
                      </Button>
                    </motion.div>
                  ))}
                </div>
                
                {/* Contact Info (Commented Out as original) */}
                {/* <div className="mt-6 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Need immediate assistance?
                  </p>
                  <a 
                    href="tel:+1234567890" 
                    className="group/phone inline-block text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline mt-1"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      +1 (234) 567-890
                    </span>
                  </a>
                </div> */}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}