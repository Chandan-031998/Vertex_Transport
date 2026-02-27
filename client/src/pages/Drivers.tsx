import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, EmptyState, FilterRow, Input, KpiCard, PaginationBar, Select, StatusBadge, TableShell } from "../components/admin/Primitives";
import { http } from "../api/http";

type Driver = {
  id: number;
  name: string;
  phone: string | null;
  license_no: string | null;
  license_expiry: string | null;
  date_of_birth: string | null;
  address: string | null;
  aadhaar_number: string | null;
  pan_number: string | null;
  blood_group: string | null;
  photo_path: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  joining_date: string | null;
  experience_years: number | null;
  salary: number | null;
  commission_type: string | null;
  driving_badge_number: string | null;
  bank_name: string | null;
  account_number: string | null;
  ifsc_code: string | null;
  upi_id: string | null;
  kyc_status: string;
  status: string;
};

const emptyForm = {
  name: "",
  phone: "",
  license_no: "",
  license_expiry: "",
  date_of_birth: "",
  address: "",
  aadhaar_number: "",
  pan_number: "",
  blood_group: "",
  photo_path: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  joining_date: "",
  experience_years: "",
  salary: "",
  commission_type: "FIXED",
  driving_badge_number: "",
  bank_name: "",
  account_number: "",
  ifsc_code: "",
  upi_id: "",
};

export default function Drivers() {
  const [rows, setRows] = useState<Driver[]>([]);
  const [form, setForm] = useState<any>(emptyForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await http.get("/drivers");
      setRows(res.data?.data || []);
      setErr(null);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to load drivers");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const active = rows.filter((x) => x.status === "ACTIVE").length;
    const verified = rows.filter((x) => x.kyc_status === "VERIFIED").length;
    const expiring = rows.filter((x) => x.license_expiry).length;
    return { active, verified, expiring };
  }, [rows]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...form,
        experience_years: form.experience_years ? Number(form.experience_years) : null,
        salary: form.salary ? Number(form.salary) : null,
      };
      if (editingId) {
        await http.put(`/drivers/${editingId}`, payload);
        if (photoFile) {
          const fd = new FormData();
          fd.append("file", photoFile);
          await http.post(`/drivers/${editingId}/photo`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        }
      } else {
        const created = await http.post("/drivers", payload);
        const createdId = created.data?.data?.id;
        if (photoFile && createdId) {
          const fd = new FormData();
          fd.append("file", photoFile);
          await http.post(`/drivers/${createdId}/photo`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        }
      }
      setEditingId(null);
      setForm(emptyForm);
      setPhotoFile(null);
      await load();
    } catch (e: any) {
      const details = e?.response?.data?.details;
      const detailMsg = Array.isArray(details) ? details[0]?.message : null;
      setErr(detailMsg || e?.response?.data?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const edit = (d: Driver) => {
    setEditingId(d.id);
    setForm({
      name: d.name,
      phone: d.phone || "",
      license_no: d.license_no || "",
      license_expiry: d.license_expiry || "",
      date_of_birth: d.date_of_birth || "",
      address: d.address || "",
      aadhaar_number: d.aadhaar_number || "",
      pan_number: d.pan_number || "",
      blood_group: d.blood_group || "",
      photo_path: d.photo_path || "",
      emergency_contact_name: d.emergency_contact_name || "",
      emergency_contact_phone: d.emergency_contact_phone || "",
      joining_date: d.joining_date || "",
      experience_years: d.experience_years || "",
      salary: d.salary || "",
      commission_type: d.commission_type || "FIXED",
      driving_badge_number: d.driving_badge_number || "",
      bank_name: d.bank_name || "",
      account_number: d.account_number || "",
      ifsc_code: d.ifsc_code || "",
      upi_id: d.upi_id || "",
      status: d.status,
      kyc_status: d.kyc_status,
    });
  };

  const remove = async (id: number) => {
    if (!window.confirm("Delete driver?")) return;
    try {
      await http.delete(`/drivers/${id}`);
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <KpiCard label="Active Drivers" value={String(stats.active)} trend="Current active status" />
        <KpiCard label="KYC Verified" value={String(stats.verified)} trend="Verified driver documents" />
        <KpiCard label="License Records" value={String(stats.expiring)} trend="Tracked license expiry" />
      </div>

      <Card title="Driver Master" subtitle="Manage profiles, KYC, payroll fields, and bank details." actions={<Button onClick={load}>Refresh</Button>}>
        {err ? <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">{err}</div> : null}

        <form onSubmit={submit} className="mb-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm((p: any) => ({ ...p, name: e.target.value }))} required />
          <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm((p: any) => ({ ...p, phone: e.target.value }))} />
          <Input placeholder="License Number" value={form.license_no} onChange={(e) => setForm((p: any) => ({ ...p, license_no: e.target.value }))} />
          <Input type="date" value={form.license_expiry} onChange={(e) => setForm((p: any) => ({ ...p, license_expiry: e.target.value }))} />
          <Input type="date" value={form.date_of_birth} onChange={(e) => setForm((p: any) => ({ ...p, date_of_birth: e.target.value }))} />
          <Input placeholder="Address" value={form.address} onChange={(e) => setForm((p: any) => ({ ...p, address: e.target.value }))} />
          <Input placeholder="Aadhaar Number" value={form.aadhaar_number} onChange={(e) => setForm((p: any) => ({ ...p, aadhaar_number: e.target.value }))} />
          <Input placeholder="PAN Number" value={form.pan_number} onChange={(e) => setForm((p: any) => ({ ...p, pan_number: e.target.value }))} />
          <Input placeholder="Blood Group" value={form.blood_group} onChange={(e) => setForm((p: any) => ({ ...p, blood_group: e.target.value }))} />
          <Input type="file" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
          <Input placeholder="Emergency Contact Name" value={form.emergency_contact_name} onChange={(e) => setForm((p: any) => ({ ...p, emergency_contact_name: e.target.value }))} />
          <Input placeholder="Emergency Contact Phone" value={form.emergency_contact_phone} onChange={(e) => setForm((p: any) => ({ ...p, emergency_contact_phone: e.target.value }))} />
          <Input type="date" value={form.joining_date} onChange={(e) => setForm((p: any) => ({ ...p, joining_date: e.target.value }))} />
          <Input placeholder="Experience (Years)" value={form.experience_years} onChange={(e) => setForm((p: any) => ({ ...p, experience_years: e.target.value }))} />
          <Input placeholder="Salary" value={form.salary} onChange={(e) => setForm((p: any) => ({ ...p, salary: e.target.value }))} />
          <Select value={form.commission_type} onChange={(e) => setForm((p: any) => ({ ...p, commission_type: e.target.value }))}>{["FIXED", "PER_TRIP", "PERCENTAGE"].map((t) => <option key={t}>{t}</option>)}</Select>
          <Input placeholder="Driving Badge Number" value={form.driving_badge_number} onChange={(e) => setForm((p: any) => ({ ...p, driving_badge_number: e.target.value }))} />
          <Input placeholder="Bank Name" value={form.bank_name} onChange={(e) => setForm((p: any) => ({ ...p, bank_name: e.target.value }))} />
          <Input placeholder="Account Number" value={form.account_number} onChange={(e) => setForm((p: any) => ({ ...p, account_number: e.target.value }))} />
          <Input placeholder="IFSC Code" value={form.ifsc_code} onChange={(e) => setForm((p: any) => ({ ...p, ifsc_code: e.target.value }))} />
          <Input placeholder="UPI ID" value={form.upi_id} onChange={(e) => setForm((p: any) => ({ ...p, upi_id: e.target.value }))} />
          <div className="flex gap-2 md:col-span-2 xl:col-span-4">
            <Button type="submit" variant="primary" disabled={busy}>{busy ? "Saving..." : editingId ? "Update Driver" : "Create Driver"}</Button>
            {editingId ? <Button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</Button> : null}
          </div>
        </form>

        <FilterRow>
          <Input placeholder="Search driver..." />
          <Select defaultValue="all"><option value="all">KYC</option></Select>
          <Select defaultValue="all"><option value="all">Status</option></Select>
          <Input type="date" />
          <Input type="date" />
          <Button>Apply</Button>
        </FilterRow>

        <TableShell
          headers={["Driver", "Phone", "License", "KYC", "Commission", "Status", "Actions"]}
          rows={rows.map((d) => (
            <tr key={d.id} className="border-t border-slate-100 hover:bg-slate-50/70">
              <td className="px-4 py-3 font-medium">{d.name}</td>
              <td className="px-4 py-3">{d.phone || "-"}</td>
              <td className="px-4 py-3">{d.license_no || "-"}</td>
              <td className="px-4 py-3"><StatusBadge status={d.kyc_status} /></td>
              <td className="px-4 py-3">{d.commission_type || "-"}</td>
              <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => edit(d)}>Edit</Button>
                  <Button variant="danger" onClick={() => remove(d.id)}>Delete</Button>
                </div>
              </td>
            </tr>
          ))}
          mobileCards={rows.map((d) => (
            <div key={`m-${d.id}`} className="rounded-2xl border border-white/60 bg-white/80 p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">{d.name}</p>
                <StatusBadge status={d.status} />
              </div>
              <p className="mt-1 text-sm text-slate-600">{d.phone || "-"} • {d.license_no || "-"}</p>
              <div className="mt-2"><StatusBadge status={d.kyc_status} /></div>
              <div className="mt-3 flex gap-2">
                <Button variant="ghost" onClick={() => edit(d)}>Edit</Button>
                <Button variant="danger" onClick={() => remove(d.id)}>Delete</Button>
              </div>
            </div>
          ))}
          emptyTitle="No drivers"
          emptyMessage="Create a driver profile to begin operations."
        />
        {!rows.length ? <div className="mt-3"><EmptyState title="Driver list is empty" message="Driver records from DB will show here." /></div> : null}
        <PaginationBar summary={`Total drivers: ${rows.length}`} />
      </Card>
    </div>
  );
}
