import React from "react";
import { Link } from "react-router-dom";

export default function Forbidden() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white/90 p-8 text-center shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Access denied</h1>
        <p className="mt-3 text-slate-600">You do not have permission to view this screen.</p>
        <Link to="/" className="mt-6 inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
