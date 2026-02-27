import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const classes: Record<Variant, string> = {
  primary: "enterprise-btn-primary",
  secondary: "enterprise-btn",
  ghost: "enterprise-btn-ghost",
  danger: "enterprise-btn-danger",
};

export function Button({ className = "", variant = "secondary", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${classes[variant]} ${className}`}
    />
  );
}
