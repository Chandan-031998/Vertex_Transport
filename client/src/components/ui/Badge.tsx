import React from "react";

export function Badge({ status }: { status: string }) {
  const v = String(status || "").toUpperCase();
  let cls = "bg-slate-100 text-slate-700";
  if (["ACTIVE", "PAID", "APPROVED", "VERIFIED"].includes(v)) cls = "bg-emerald-100 text-emerald-700";
  if (["PENDING", "ISSUED", "PARTIAL", "IN_REVIEW"].includes(v)) cls = "bg-amber-100 text-amber-700";
  if (["EXPIRED", "OVERDUE", "REJECTED", "INACTIVE"].includes(v)) cls = "bg-rose-100 text-rose-700";
  if (["IN_TRANSIT", "STARTED"].includes(v)) cls = "bg-blue-100 text-blue-700";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>{status}</span>;
}
