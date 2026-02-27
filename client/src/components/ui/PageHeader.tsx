import React from "react";

export function PageHeader({ title, breadcrumb, actions }: { title: string; breadcrumb?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          {breadcrumb && <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{breadcrumb}</p>}
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        </div>
        {actions}
      </div>
    </div>
  );
}
