import React from "react";
import { EmptyState } from "./EmptyState";

type DataTableProps = {
  headers: string[];
  rows: React.ReactNode;
  mobileCards?: React.ReactNode;
  emptyTitle?: string;
  emptyMessage?: string;
};

export function DataTable({ headers, rows, mobileCards, emptyTitle, emptyMessage }: DataTableProps) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-2xl border border-white/40 bg-white/65 shadow-glass backdrop-blur-sm md:block dark:bg-slate-900/50">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 z-10 border-b border-slate-100 bg-slate-50/85 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/70">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {mobileCards ||
          (emptyTitle && emptyMessage ? <EmptyState title={emptyTitle} message={emptyMessage} /> : null)}
      </div>
    </>
  );
}
