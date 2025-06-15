"use client";

import { motion } from "@/utils/motion";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackground?: boolean;
  className?: string;
}

export default function Header({
  title,
  subtitle,
  showBackground = true,
  className = "",
}: HeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className={`text-center mb-10 ${
        showBackground
          ? "p-6 bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-800"
          : ""
      } ${className}`}
    >
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
        {title}
      </h1>

      {subtitle && (
        <p className="text-lg text-gray-300 max-w-3xl mx-auto">{subtitle}</p>
      )}
    </motion.div>
  );
}
