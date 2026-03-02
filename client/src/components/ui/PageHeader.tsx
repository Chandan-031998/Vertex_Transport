import React from "react";
import { motion } from "framer-motion";

export function PageHeader({ title, breadcrumb, actions }: { title: string; breadcrumb?: string; actions?: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26 }}
      className="mb-6 rounded-2xl border border-white/40 bg-white/60 p-5 shadow-glass backdrop-blur-sm dark:bg-slate-900/55"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          {breadcrumb && (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              {breadcrumb}
            </p>
          )}
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">{title}</h1>
        </div>
        {actions}
      </div>
    </motion.div>
  );
}
