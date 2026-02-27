import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { Button, Card, Input } from "../components/ui";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@vertex.local");
  const [password, setPassword] = useState("Admin@123");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await login(email, password);
      nav("/", { replace: true });
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-10">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-2">
        <div className="hidden rounded-3xl border border-white/60 bg-white/70 p-8 shadow-sm backdrop-blur lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Vertex Transport Manager</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">Enterprise transport ERP for Indian logistics.</h1>
          <p className="mt-3 text-slate-600">Fleet, drivers, trips, billing, compliance, and admin control in one platform.</p>
          <div className="mt-8 grid gap-3">
            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-3 text-sm text-slate-700">Role-based access with admin and driver workspaces.</div>
            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-3 text-sm text-slate-700">Live operational modules connected to your DB records.</div>
            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-3 text-sm text-slate-700">Theme customization with brand, colors, and style controls.</div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md lg:mx-0">
          <Card title="Sign in" subtitle="Access your enterprise workspace.">
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="text-sm text-slate-600">Email</label>
                <Input className="mt-1" value={email} onChange={e=>setEmail(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-slate-600">Password</label>
                <Input type="password" className="mt-1" value={password} onChange={e=>setPassword(e.target.value)} />
              </div>
              {err && <div className="rounded-xl border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">{err}</div>}
              <Button disabled={busy} variant="primary" className="w-full">
                {busy ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="mt-4 text-xs text-slate-500">
              API should run on <code>http://localhost:4000</code>. Update <code>VITE_API_BASE_URL</code> if needed.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
