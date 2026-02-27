import React from "react";

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
  const trendTone =
    tone === "success"
      ? "text-emerald-600"
      : tone === "warning"
        ? "text-amber-600"
        : tone === "danger"
          ? "text-rose-600"
          : "text-slate-500";

  return (
    <article className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {icon ? <span className="text-slate-400">{icon}</span> : null}
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      {trend ? <p className={`mt-1 text-xs ${trendTone}`}>{trend}</p> : null}
    </article>
  );
}
