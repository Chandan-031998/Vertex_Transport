import React from "react";
import { Boxes } from "lucide-react";

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/65 p-6 text-center shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/50">
      <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/90 to-cyan-500/90 text-white shadow-md">
        <Boxes size={20} />
      </div>
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}
