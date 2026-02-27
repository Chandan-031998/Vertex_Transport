import React from "react";

export function Card({ title, subtitle, actions, children, className = "" }: { title?: string; subtitle?: string; actions?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur ${className}`}>
      {(title || actions) && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <div>
            {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
