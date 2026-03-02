import React, { useEffect, useMemo, useState } from "react";
import { ImagePlus, Moon, PaintBucket, Sun } from "lucide-react";
import { http } from "../api/http";
import PermissionGate from "../auth/PermissionGate";
import { Permissions } from "../constants/permissions";
import { Badge, Button, Card, EmptyState, Input, Select } from "../components/ui";
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

const themePresets = [
  { name: "Indigo + Cyan", primary: "#4f46e5", secondary: "#06b6d4" },
  { name: "Blue + Emerald", primary: "#2563eb", secondary: "#10b981" },
  { name: "Violet + Sky", primary: "#7c3aed", secondary: "#0ea5e9" },
];

export default function Settings() {
  const { theme, setTheme, toggleDarkMode } = useTheme();
  const [form, setForm] = useState<SettingsData>({ feature_toggles: defaultFeatureToggles });
  const [branches, setBranches] = useState<any[]>([]);
  const [branchForm, setBranchForm] = useState<any>({ name: "", city: "", is_hub: false, status: "ACTIVE" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const load = async () => {
    try {
      const [settingsRes, branchesRes] = await Promise.all([http.get("/settings/company"), http.get("/settings/branches")]);
      const data = settingsRes.data?.data || {};
      setForm({ ...data, feature_toggles: { ...defaultFeatureToggles, ...(data.feature_toggles || {}) } });
      setTheme({
        brand_name: data.brand_name || "Vertex Transport Manager",
        logo_url: data.logo_url || null,
        primary_color: data.primary_color || "#4f46e5",
        secondary_color: data.secondary_color || "#06b6d4",
        ui_style: data.ui_style || "SOFT",
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

  const previewLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const local = URL.createObjectURL(file);
    setLogoPreview(local);
  };

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
        primary_color: data.primary_color || "#4f46e5",
        secondary_color: data.secondary_color || "#06b6d4",
        ui_style: data.ui_style || "SOFT",
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

  const previewTheme = useMemo(
    () => ({
      brand_name: form.brand_name || "Vertex Transport Manager",
      logo_url: form.logo_url || null,
      primary_color: form.primary_color || "#4f46e5",
      secondary_color: form.secondary_color || "#06b6d4",
      ui_style: (form.ui_style || "SOFT") as any,
    }),
    [form],
  );

  return (
    <div className="space-y-4">
      <Card
        title="White Label Branding"
        subtitle="Customize logo, colors, style and company identity."
        actions={<Button onClick={load}>Refresh</Button>}
      >
        {err ? <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">{err}</div> : null}

        <form onSubmit={save} className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Brand name" value={form.brand_name || ""} onChange={(e) => setForm((p) => ({ ...p, brand_name: e.target.value }))} />
          <Input placeholder="Logo URL (for permanent save)" value={form.logo_url || ""} onChange={(e) => setForm((p) => ({ ...p, logo_url: e.target.value }))} />
          <Input placeholder="Support email" value={form.support_email || ""} onChange={(e) => setForm((p) => ({ ...p, support_email: e.target.value }))} />
          <Input placeholder="Support phone" value={form.support_phone || ""} onChange={(e) => setForm((p) => ({ ...p, support_phone: e.target.value }))} />

          <div className="md:col-span-2 rounded-2xl border border-white/40 bg-white/65 p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800"><PaintBucket size={16} /> Branding Studio</p>
              <Button type="button" onClick={toggleDarkMode}>{theme.dark_mode ? <Sun size={14} /> : <Moon size={14} />} Toggle {theme.dark_mode ? "Light" : "Dark"}</Button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="rounded-xl border border-slate-200/70 bg-white/80 p-3 text-sm text-slate-600">
                Primary Color
                <Input type="color" value={form.primary_color || "#4f46e5"} onChange={(e) => setForm((p) => ({ ...p, primary_color: e.target.value }))} />
              </label>
              <label className="rounded-xl border border-slate-200/70 bg-white/80 p-3 text-sm text-slate-600">
                Secondary Color
                <Input type="color" value={form.secondary_color || "#06b6d4"} onChange={(e) => setForm((p) => ({ ...p, secondary_color: e.target.value }))} />
              </label>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {themePresets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  className="rounded-xl border border-white/50 bg-white/85 px-3 py-2 text-xs font-medium text-slate-700"
                  onClick={() => setForm((p) => ({ ...p, primary_color: preset.primary, secondary_color: preset.secondary }))}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            <div className="mt-3 grid gap-2 md:grid-cols-3">
              <Select value={form.ui_style || "SOFT"} onChange={(e) => setForm((p) => ({ ...p, ui_style: e.target.value as any }))}>
                <option value="CLASSIC">Classic</option>
                <option value="SOFT">Soft</option>
                <option value="GLASS">Glass</option>
              </Select>
              <label className="col-span-2 flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm text-slate-600">
                <ImagePlus size={16} />
                <span>Logo Upload Preview</span>
                <input type="file" accept="image/*" onChange={previewLogo} className="text-xs" />
              </label>
            </div>

            <div className="mt-3 rounded-2xl border border-white/40 bg-gradient-to-r p-4" style={{ backgroundImage: `linear-gradient(90deg, ${form.primary_color || "#4f46e5"}20 0%, ${form.secondary_color || "#06b6d4"}20 100%)` }}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Company Branding Preview</p>
              <div className="flex items-center gap-3 rounded-xl bg-white/85 p-3 shadow-sm">
                <div className="h-10 w-10 overflow-hidden rounded-lg border border-white/60 bg-white">
                  {logoPreview || form.logo_url ? (
                    <img src={logoPreview || (form.logo_url as string)} alt="Brand logo preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-r from-indigo-500 to-cyan-500 text-xs font-bold text-white">VT</div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{form.brand_name || "Vertex Transport Manager"}</p>
                  <Badge status="ACTIVE" />
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() =>
                  setTheme({
                    brand_name: previewTheme.brand_name,
                    logo_url: logoPreview || previewTheme.logo_url,
                    primary_color: previewTheme.primary_color,
                    secondary_color: previewTheme.secondary_color,
                    ui_style: previewTheme.ui_style,
                  } as any)
                }
              >
                Preview Branding
              </Button>
              <PermissionGate anyOf={[Permissions.SETTINGS_MANAGE]}>
                <Button disabled={busy} variant="primary">{busy ? "Saving..." : "Save Branding"}</Button>
              </PermissionGate>
            </div>
          </div>

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
