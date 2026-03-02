import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export function KpiCard({
  label,
  value,
  trend,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  trend?: string;
  icon?: React.ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const numeric = Number(String(value).replace(/[^0-9.-]/g, ""));
    if (Number.isNaN(numeric)) {
      setDisplayValue(value);
      return;
    }
    let frame = 0;
    const steps = 22;
    const id = window.setInterval(() => {
      frame += 1;
      const current = Math.round((numeric * frame) / steps);
      setDisplayValue(value.replace(/[0-9][0-9,]*/g, current.toLocaleString("en-IN")));
      if (frame >= steps) window.clearInterval(id);
    }, 22);

    return () => window.clearInterval(id);
  }, [value]);

  const trendTone =
    tone === "success"
      ? "text-emerald-600"
      : tone === "warning"
        ? "text-amber-600"
        : tone === "danger"
          ? "text-rose-600"
          : "text-slate-500";

  return (
    <motion.article
      whileHover={{ y: -4, boxShadow: "0 18px 36px rgba(15,23,42,0.18)" }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-white/40 bg-white/70 p-4 shadow-glass backdrop-blur-sm dark:bg-slate-900/55"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{displayValue}</p>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-md">
          {icon || <ArrowUpRight size={16} />}
        </span>
      </div>

      <p className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${trendTone}`}>
        <ArrowUpRight size={12} />
        {trend || "+12% this month"}
      </p>
    </motion.article>
  );
}
