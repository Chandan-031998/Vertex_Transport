import React from "react";
import {
  Badge as UiBadge,
  Button as UiButton,
  Card as UiCard,
  DataTable as UiDataTable,
  EmptyState,
  Input as UiInput,
  KpiCard as UiKpiCard,
  Select as UiSelect,
} from "../ui";

export function StatusBadge({ status }: { status: string }) {
  return <UiBadge status={status} />;
}

export function Card({ title, children, actions }: { title: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return <UiCard title={title} actions={actions}>{children}</UiCard>;
}

export function KpiCard({ label, value, delta }: { label: string; value: string; delta?: string }) {
  return <UiKpiCard label={label} value={value} trend={delta} />;
}

export function FilterRow({ children }: { children: React.ReactNode }) {
  return <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">{children}</div>;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <UiInput {...props} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <UiSelect {...props} />;
}

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variant = (props as any).variant === "primary" ? "primary" : "secondary";
  return <UiButton {...props} variant={variant} />;
}

export function TableShell({
  headers,
  rows,
  mobileCards,
  emptyTitle,
  emptyMessage,
}: {
  headers: string[];
  rows: React.ReactNode;
  mobileCards?: React.ReactNode;
  emptyTitle?: string;
  emptyMessage?: string;
}) {
  return <UiDataTable headers={headers} rows={rows} mobileCards={mobileCards} emptyTitle={emptyTitle} emptyMessage={emptyMessage} />;
}

export function PaginationBar({ summary = "Pagination ready" }: { summary?: string }) {
  return (
    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
      <span>{summary}</span>
      <div className="flex gap-2">
        <button className="enterprise-btn">Previous</button>
        <button className="enterprise-btn">Next</button>
      </div>
    </div>
  );
}

export function LineChart() {
  return (
    <svg viewBox="0 0 300 120" className="h-36 w-full">
      <path d="M0 95 L300 95" stroke="#e2e8f0" strokeWidth="1" />
      <path d="M0 75 L300 75" stroke="#e2e8f0" strokeWidth="1" />
      <path d="M0 55 L300 55" stroke="#e2e8f0" strokeWidth="1" />
      <polyline fill="none" stroke="#2563eb" strokeWidth="3" points="10,90 60,65 110,72 160,48 210,57 260,40 295,44" />
      <polyline fill="none" stroke="#ef4444" strokeWidth="3" points="10,98 60,82 110,76 160,68 210,74 260,59 295,62" />
    </svg>
  );
}

export function BarChart() {
  const bars = [62, 88, 45, 74, 57, 92];
  return (
    <div className="flex h-36 items-end gap-3">
      {bars.map((b, i) => (
        <div key={i} className="w-full rounded-t-xl bg-blue-500/80" style={{ height: `${b}%` }} />
      ))}
    </div>
  );
}

export function PieLegend() {
  return (
    <div className="grid gap-2 text-sm text-slate-600">
      <div><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />Diesel 42%</div>
      <div><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />Toll 23%</div>
      <div><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />Repair 18%</div>
      <div><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-slate-400" />Other 17%</div>
    </div>
  );
}

export { EmptyState };
