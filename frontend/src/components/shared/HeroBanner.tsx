import { motion } from "framer-motion";
import { ReactNode } from "react";

interface HeroBannerProps {
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  children?: ReactNode;
  overlay?: "light" | "dark";
  align?: "left" | "center";
}

export function HeroBanner({
  title,
  subtitle,
  description,
  image,
  children,
  overlay = "dark",
  align = "left",
}: HeroBannerProps) {
  return (
    <section className="relative min-h-[60vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={image}
          alt=""
          className="w-full h-full object-cover"
        />
        <div
          className={`absolute inset-0 ${
            overlay === "dark"
              ? "bg-gradient-to-r from-secondary/95 via-secondary/80 to-secondary/40"
              : "hero-overlay"
          }`}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container-custom section-padding pt-32">
        <div className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`text-sm font-semibold uppercase tracking-wider mb-4 ${
                overlay === "dark" ? "text-primary" : "text-primary"
              }`}
            >
              {subtitle}
            </motion.p>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-6 leading-tight ${
              overlay === "dark" ? "text-primary-foreground" : "text-foreground"
            }`}
          >
            {title}
          </motion.h1>
          {description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-lg md:text-xl mb-8 max-w-2xl ${
                align === "center" ? "mx-auto" : ""
              } ${
                overlay === "dark" ? "text-primary-foreground/80" : "text-muted-foreground"
              }`}
            >
              {description}
            </motion.p>
          )}
          {children && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`flex flex-wrap gap-4 ${align === "center" ? "justify-center" : ""}`}
            >
              {children}
            </motion.div>
          )}
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
