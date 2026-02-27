import React, { useEffect, useState } from "react";
import { http } from "../api/http";
import PermissionGate from "../auth/PermissionGate";
import { Permissions } from "../constants/permissions";
import { Button, Card, EmptyState, Input, Select } from "../components/ui";
import { useTheme } from "../theme/ThemeProvider";

type SettingsData = {
  brand_name?: string | null;
  company_address?: string | null;
  gst_no?: string | null;
  gst_type?: "REGULAR" | "COMPOSITION" | "UNREGISTERED" | null;
  financial_year_start?: string | null;
  invoice_prefix?: string | null;
  invoice_series?: number | null;
  logo_url?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  ui_style?: "CLASSIC" | "SOFT" | "GLASS" | null;
  support_email?: string | null;
  support_phone?: string | null;
  notify_email?: boolean;
  notify_whatsapp?: boolean;
  notify_sms?: boolean;
  feature_toggles?: Record<string, boolean> | null;
};

const defaultFeatureToggles: Record<string, boolean> = {
  tracking: false,
  vendors: false,
  brokers: false,
  compliance: false,
  advanced_billing: false,
  advanced_reports: false,
  white_label_domain: false,
};

export default function Settings() {
  const { setTheme } = useTheme();
  const [form, setForm] = useState<SettingsData>({ feature_toggles: defaultFeatureToggles });
  const [branches, setBranches] = useState<any[]>([]);
  const [branchForm, setBranchForm] = useState<any>({ name: "", city: "", is_hub: false, status: "ACTIVE" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    try {
      const [settingsRes, branchesRes] = await Promise.all([
        http.get("/settings/company"),
        http.get("/settings/branches"),
      ]);
      const data = settingsRes.data?.data || {};
      setForm({ ...data, feature_toggles: { ...defaultFeatureToggles, ...(data.feature_toggles || {}) } });
      setTheme({
        brand_name: data.brand_name || "Vertex Transport Manager",
        logo_url: data.logo_url || null,
        primary_color: data.primary_color || "#2563eb",
        secondary_color: data.secondary_color || "#1d4ed8",
        ui_style: data.ui_style || "CLASSIC",
      } as any);
      setBranches(branchesRes.data?.data || []);
      setErr(null);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to load settings");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await http.put("/settings/company", {
        ...form,
        feature_toggles: form.feature_toggles || defaultFeatureToggles,
      });
      const data = res.data?.data || {};
      setForm({ ...data, feature_toggles: { ...defaultFeatureToggles, ...(data.feature_toggles || {}) } });
      setTheme({
        brand_name: data.brand_name || "Vertex Transport Manager",
        logo_url: data.logo_url || null,
        primary_color: data.primary_color || "#2563eb",
        secondary_color: data.secondary_color || "#1d4ed8",
        ui_style: data.ui_style || "CLASSIC",
      } as any);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to update settings");
    } finally {
      setBusy(false);
    }
  };

  const addBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await http.post("/settings/branches", branchForm);
      setBranchForm({ name: "", city: "", is_hub: false, status: "ACTIVE" });
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to save branch");
    }
  };

  const deleteBranch = async (id: number) => {
    if (!window.confirm("Delete branch?")) return;
    try {
      await http.delete(`/settings/branches/${id}`);
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to delete branch");
    }
  };

  const exportMaster = async (entity: string) => {
    try {
      const res = await http.get(`/settings/export/${entity}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${entity}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Export failed");
    }
  };

  return (
    <div className="space-y-4">
      <Card title="Company & Branding Settings" subtitle="Customize product name, colors, style, and tenant defaults." actions={<Button onClick={load}>Refresh</Button>}>
        {err ? <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">{err}</div> : null}
        <form onSubmit={save} className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Brand name" value={form.brand_name || ""} onChange={(e) => setForm((p) => ({ ...p, brand_name: e.target.value }))} />
          <Input placeholder="GST number" value={form.gst_no || ""} onChange={(e) => setForm((p) => ({ ...p, gst_no: e.target.value }))} />
          <Input placeholder="Company address" value={form.company_address || ""} onChange={(e) => setForm((p) => ({ ...p, company_address: e.target.value }))} />
          <Select value={form.gst_type || "REGULAR"} onChange={(e) => setForm((p) => ({ ...p, gst_type: e.target.value as any }))}>
            <option value="REGULAR">REGULAR</option>
            <option value="COMPOSITION">COMPOSITION</option>
            <option value="UNREGISTERED">UNREGISTERED</option>
          </Select>
          <Input type="date" value={form.financial_year_start || ""} onChange={(e) => setForm((p) => ({ ...p, financial_year_start: e.target.value }))} />
          <Input placeholder="Invoice prefix" value={form.invoice_prefix || ""} onChange={(e) => setForm((p) => ({ ...p, invoice_prefix: e.target.value }))} />
          <Input placeholder="Invoice series" value={form.invoice_series || ""} onChange={(e) => setForm((p) => ({ ...p, invoice_series: Number(e.target.value || 1) }))} />
          <Input placeholder="Logo URL" value={form.logo_url || ""} onChange={(e) => setForm((p) => ({ ...p, logo_url: e.target.value }))} />
          <Input placeholder="Support email" value={form.support_email || ""} onChange={(e) => setForm((p) => ({ ...p, support_email: e.target.value }))} />
          <Input placeholder="Support phone" value={form.support_phone || ""} onChange={(e) => setForm((p) => ({ ...p, support_phone: e.target.value }))} />

          <div className="md:col-span-2 rounded-2xl border border-slate-200/70 bg-white/70 p-4">
            <p className="mb-2 text-sm font-semibold text-slate-800">Theme Studio</p>
            <div className="grid gap-2 md:grid-cols-3">
              <Input type="color" value={form.primary_color || "#2563eb"} onChange={(e) => setForm((p) => ({ ...p, primary_color: e.target.value }))} />
              <Input type="color" value={form.secondary_color || "#1d4ed8"} onChange={(e) => setForm((p) => ({ ...p, secondary_color: e.target.value }))} />
              <Select value={form.ui_style || "CLASSIC"} onChange={(e) => setForm((p) => ({ ...p, ui_style: e.target.value as any }))}>
                <option value="CLASSIC">Classic</option>
                <option value="SOFT">Soft</option>
                <option value="GLASS">Glass</option>
              </Select>
            </div>
            <div className="mt-2 flex gap-2">
              <Button type="button" onClick={() => setTheme({
                brand_name: form.brand_name || "Vertex Transport Manager",
                logo_url: form.logo_url || null,
                primary_color: form.primary_color || "#2563eb",
                secondary_color: form.secondary_color || "#1d4ed8",
                ui_style: (form.ui_style || "CLASSIC") as any,
              })}>
                Preview Theme
              </Button>
              <PermissionGate anyOf={[Permissions.SETTINGS_MANAGE]}>
                <Button disabled={busy} variant="primary">{busy ? "Saving..." : "Save Settings"}</Button>
              </PermissionGate>
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 gap-2 text-sm md:grid-cols-3">
            <label className="rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2"><input type="checkbox" checked={!!form.notify_email} onChange={(e) => setForm((p) => ({ ...p, notify_email: e.target.checked }))} /> Email notifications</label>
            <label className="rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2"><input type="checkbox" checked={!!form.notify_whatsapp} onChange={(e) => setForm((p) => ({ ...p, notify_whatsapp: e.target.checked }))} /> WhatsApp notifications</label>
            <label className="rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2"><input type="checkbox" checked={!!form.notify_sms} onChange={(e) => setForm((p) => ({ ...p, notify_sms: e.target.checked }))} /> SMS notifications</label>
          </div>

          <div className="md:col-span-2 rounded-2xl border border-slate-200/70 bg-white/70 p-4">
            <p className="mb-2 text-sm font-semibold text-slate-800">Feature Toggles</p>
            <div className="grid gap-2 md:grid-cols-2">
              {Object.keys(defaultFeatureToggles).map((k) => (
                <label key={k} className="rounded-xl border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={!!(form.feature_toggles || {})[k]}
                    onChange={(e) => setForm((p) => ({ ...p, feature_toggles: { ...(p.feature_toggles || {}), [k]: e.target.checked } }))}
                  /> {k}
                </label>
              ))}
            </div>
          </div>
        </form>
      </Card>

      <Card title="Branches / Hubs">
        <PermissionGate anyOf={[Permissions.BRANCHES_MANAGE, Permissions.SETTINGS_MANAGE]}>
          <form className="grid gap-2 md:grid-cols-5" onSubmit={addBranch}>
            <Input placeholder="Branch name" value={branchForm.name} onChange={(e) => setBranchForm((p: any) => ({ ...p, name: e.target.value }))} required />
            <Input placeholder="City" value={branchForm.city} onChange={(e) => setBranchForm((p: any) => ({ ...p, city: e.target.value }))} />
            <label className="rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm"><input type="checkbox" checked={!!branchForm.is_hub} onChange={(e) => setBranchForm((p: any) => ({ ...p, is_hub: e.target.checked }))} /> Hub</label>
            <Select value={branchForm.status} onChange={(e) => setBranchForm((p: any) => ({ ...p, status: e.target.value }))}><option>ACTIVE</option><option>INACTIVE</option></Select>
            <Button variant="primary">Add Branch</Button>
          </form>
        </PermissionGate>

        <div className="mt-3 space-y-2 text-sm">
          {branches.length ? branches.map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white/70 p-2">
              <span>{b.name} ({b.city || "-"}) {b.is_hub ? "[HUB]" : ""} • {b.status}</span>
              <PermissionGate anyOf={[Permissions.BRANCHES_MANAGE, Permissions.SETTINGS_MANAGE]}>
                <Button variant="danger" onClick={() => deleteBranch(b.id)}>Delete</Button>
              </PermissionGate>
            </div>
          )) : <EmptyState title="No branches configured" message="Add branch or hub details to configure operations." />}
        </div>
      </Card>

      <Card title="Backup / Export Master Data">
        <div className="flex flex-wrap gap-2">
          {["vehicles", "drivers", "trips", "invoices"].map((entity) => (
            <Button key={entity} onClick={() => exportMaster(entity)}>Export {entity}</Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
