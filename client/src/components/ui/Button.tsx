import React from "react";
import { motion } from "framer-motion";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const classes: Record<Variant, string> = {
  primary: "enterprise-btn-primary",
  secondary: "enterprise-btn",
  ghost: "enterprise-btn-ghost",
  danger: "enterprise-btn-danger",
};

export function Button({
  className = "",
  variant = "secondary",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${classes[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
}
