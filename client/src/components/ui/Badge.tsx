import React from "react";

export function Badge({ status }: { status: string }) {
  const v = String(status || "").toUpperCase();
  let cls = "bg-slate-100 text-slate-700 border-slate-200";
  if (["ACTIVE", "PAID", "APPROVED", "VERIFIED"].includes(v)) cls = "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (["PENDING", "ISSUED", "PARTIAL", "IN_REVIEW"].includes(v)) cls = "bg-amber-100 text-amber-700 border-amber-200";
  if (["EXPIRED", "OVERDUE", "REJECTED", "INACTIVE"].includes(v)) cls = "bg-rose-100 text-rose-700 border-rose-200";
  if (["IN_TRANSIT", "STARTED"].includes(v)) cls = "bg-indigo-100 text-indigo-700 border-indigo-200";
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${cls}`}>{status}</span>;
}
