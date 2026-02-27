import React, { useEffect, useState } from "react";
import { Button, Card, EmptyState, FilterRow, Input, KpiCard, PaginationBar, Select, StatusBadge, TableShell } from "../components/admin/Primitives";
import { http } from "../api/http";

type Vehicle = {
  id: number;
  vehicle_no: string;
  vehicle_type: string;
  make: string | null;
  model: string | null;
  year: number | null;
  chassis_number: string | null;
  engine_number: string | null;
  fuel_type: string | null;
  vehicle_capacity_tons: number | null;
  odometer_reading: number | null;
  fuel_tank_capacity_liters: number | null;
  rc_owner_name: string | null;
  rc_owner_address: string | null;
  insurance_provider: string | null;
  policy_number: string | null;
  insurance_start_date: string | null;
  insurance_expiry_date: string | null;
  permit_type: string | null;
  permit_state: string | null;
  permit_expiry_date: string | null;
  gps_device_id: string | null;
  fastag_id: string | null;
  purchase_date: string | null;
  purchase_cost: number | null;
  loan_emi: number | null;
  emi_due_date: string | null;
  status: string;
};

const emptyForm = {
  vehicle_no: "",
  vehicle_type: "LCV",
  make: "",
  model: "",
  year: "",
  chassis_number: "",
  engine_number: "",
  fuel_type: "DIESEL",
  vehicle_capacity_tons: "",
  odometer_reading: "",
  fuel_tank_capacity_liters: "",
  rc_owner_name: "",
  rc_owner_address: "",
  insurance_provider: "",
  policy_number: "",
  insurance_start_date: "",
  insurance_expiry_date: "",
  permit_type: "STATE",
  permit_state: "",
  permit_expiry_date: "",
  gps_device_id: "",
  fastag_id: "",
  purchase_date: "",
  purchase_cost: "",
  loan_emi: "",
  emi_due_date: "",
};

export default function Fleet() {
  const [rows, setRows] = useState<Vehicle[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    try {
      const [vRes, sRes] = await Promise.all([http.get("/fleet/vehicles"), http.get("/fleet/summary")]);
      setRows(vRes.data?.data || []);
      setSummary(sRes.data?.data || null);
      setErr(null);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to load fleet");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        vehicle_no: form.vehicle_no,
        vehicle_type: form.vehicle_type,
        make: form.make || null,
        model: form.model || null,
        year: form.year ? Number(form.year) : null,
        chassis_number: form.chassis_number || null,
        engine_number: form.engine_number || null,
        fuel_type: form.fuel_type || null,
        vehicle_capacity_tons: form.vehicle_capacity_tons ? Number(form.vehicle_capacity_tons) : null,
        odometer_reading: form.odometer_reading ? Number(form.odometer_reading) : null,
        fuel_tank_capacity_liters: form.fuel_tank_capacity_liters ? Number(form.fuel_tank_capacity_liters) : null,
        rc_owner_name: form.rc_owner_name || null,
        rc_owner_address: form.rc_owner_address || null,
        insurance_provider: form.insurance_provider || null,
        policy_number: form.policy_number || null,
        insurance_start_date: form.insurance_start_date || null,
        insurance_expiry_date: form.insurance_expiry_date || null,
        permit_type: form.permit_type || null,
        permit_state: form.permit_state || null,
        permit_expiry_date: form.permit_expiry_date || null,
        gps_device_id: form.gps_device_id || null,
        fastag_id: form.fastag_id || null,
        purchase_date: form.purchase_date || null,
        purchase_cost: form.purchase_cost ? Number(form.purchase_cost) : null,
        loan_emi: form.loan_emi ? Number(form.loan_emi) : null,
        emi_due_date: form.emi_due_date || null,
      };
      if (editingId) {
        await http.put(`/fleet/vehicles/${editingId}`, payload);
      } else {
        await http.post("/fleet/vehicles", payload);
      }
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (e: any) {
      const details = e?.response?.data?.details;
      const detailMsg = Array.isArray(details) ? details[0]?.message : null;
      setErr(detailMsg || e?.response?.data?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const edit = (v: Vehicle) => {
    setEditingId(v.id);
    setForm({
      vehicle_no: v.vehicle_no,
      vehicle_type: v.vehicle_type,
      make: v.make || "",
      model: v.model || "",
      year: v.year || "",
      chassis_number: v.chassis_number || "",
      engine_number: v.engine_number || "",
      fuel_type: v.fuel_type || "DIESEL",
      vehicle_capacity_tons: v.vehicle_capacity_tons || "",
      odometer_reading: v.odometer_reading || "",
      fuel_tank_capacity_liters: v.fuel_tank_capacity_liters || "",
      rc_owner_name: v.rc_owner_name || "",
      rc_owner_address: v.rc_owner_address || "",
      insurance_provider: v.insurance_provider || "",
      policy_number: v.policy_number || "",
      insurance_start_date: v.insurance_start_date || "",
      insurance_expiry_date: v.insurance_expiry_date || "",
      permit_type: v.permit_type || "STATE",
      permit_state: v.permit_state || "",
      permit_expiry_date: v.permit_expiry_date || "",
      gps_device_id: v.gps_device_id || "",
      fastag_id: v.fastag_id || "",
      purchase_date: v.purchase_date || "",
      purchase_cost: v.purchase_cost || "",
      loan_emi: v.loan_emi || "",
      emi_due_date: v.emi_due_date || "",
    });
  };

  const remove = async (id: number) => {
    if (!window.confirm("Delete vehicle?")) return;
    try {
      await http.delete(`/fleet/vehicles/${id}`);
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Total Fleet" value={String(summary?.total_fleet || 0)} trend="Registered vehicles" />
        <KpiCard label="Active" value={String(summary?.active_fleet || 0)} trend="Operational now" />
        <KpiCard label="Idle" value={String(summary?.idle_fleet || 0)} trend="Available for dispatch" />
        <KpiCard label="Maintenance" value={String(summary?.maintenance_fleet || 0)} trend="In workshop cycle" />
        <KpiCard label="Inactive" value={String(summary?.inactive_fleet || 0)} trend="Not available" />
      </div>

      <Card title="Vehicle Master" subtitle="Create and maintain vehicle details with compliance and finance fields." actions={<Button onClick={load}>Refresh</Button>}>
        {err ? <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">{err}</div> : null}

        <form onSubmit={submit} className="mb-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          <Input placeholder="Vehicle no" value={form.vehicle_no} onChange={(e) => setForm((p: any) => ({ ...p, vehicle_no: e.target.value }))} required disabled={!!editingId} />
          <Select value={form.vehicle_type} onChange={(e) => setForm((p: any) => ({ ...p, vehicle_type: e.target.value }))}>{["LCV", "HCV", "CONTAINER", "TANKER", "TIPPER", "BUS", "TEMPO", "EV"].map((t) => <option key={t}>{t}</option>)}</Select>
          <Input placeholder="Chassis Number" value={form.chassis_number} onChange={(e) => setForm((p: any) => ({ ...p, chassis_number: e.target.value }))} />
          <Input placeholder="Engine Number" value={form.engine_number} onChange={(e) => setForm((p: any) => ({ ...p, engine_number: e.target.value }))} />
          <Select value={form.fuel_type} onChange={(e) => setForm((p: any) => ({ ...p, fuel_type: e.target.value }))}>{["DIESEL", "PETROL", "EV", "CNG"].map((t) => <option key={t}>{t}</option>)}</Select>
          <Input placeholder="Capacity Tons" value={form.vehicle_capacity_tons} onChange={(e) => setForm((p: any) => ({ ...p, vehicle_capacity_tons: e.target.value }))} />
          <Input placeholder="Odometer Reading" value={form.odometer_reading} onChange={(e) => setForm((p: any) => ({ ...p, odometer_reading: e.target.value }))} />
          <Input placeholder="Fuel Tank Liters" value={form.fuel_tank_capacity_liters} onChange={(e) => setForm((p: any) => ({ ...p, fuel_tank_capacity_liters: e.target.value }))} />
          <Input placeholder="RC Owner Name" value={form.rc_owner_name} onChange={(e) => setForm((p: any) => ({ ...p, rc_owner_name: e.target.value }))} />
          <Input placeholder="RC Owner Address" value={form.rc_owner_address} onChange={(e) => setForm((p: any) => ({ ...p, rc_owner_address: e.target.value }))} />
          <Input placeholder="Insurance Provider" value={form.insurance_provider} onChange={(e) => setForm((p: any) => ({ ...p, insurance_provider: e.target.value }))} />
          <Input placeholder="Policy Number" value={form.policy_number} onChange={(e) => setForm((p: any) => ({ ...p, policy_number: e.target.value }))} />
          <Select value={form.permit_type} onChange={(e) => setForm((p: any) => ({ ...p, permit_type: e.target.value }))}>{["STATE", "NATIONAL"].map((t) => <option key={t}>{t}</option>)}</Select>
          <Input placeholder="Permit State" value={form.permit_state} onChange={(e) => setForm((p: any) => ({ ...p, permit_state: e.target.value }))} />
          <Input placeholder="GPS Device ID" value={form.gps_device_id} onChange={(e) => setForm((p: any) => ({ ...p, gps_device_id: e.target.value }))} />
          <Input placeholder="FASTag ID" value={form.fastag_id} onChange={(e) => setForm((p: any) => ({ ...p, fastag_id: e.target.value }))} />
          <Input type="date" value={form.insurance_start_date} onChange={(e) => setForm((p: any) => ({ ...p, insurance_start_date: e.target.value }))} />
          <Input type="date" value={form.insurance_expiry_date} onChange={(e) => setForm((p: any) => ({ ...p, insurance_expiry_date: e.target.value }))} />
          <Input type="date" value={form.permit_expiry_date} onChange={(e) => setForm((p: any) => ({ ...p, permit_expiry_date: e.target.value }))} />
          <Input type="date" value={form.purchase_date} onChange={(e) => setForm((p: any) => ({ ...p, purchase_date: e.target.value }))} />
          <Input placeholder="Purchase Cost" value={form.purchase_cost} onChange={(e) => setForm((p: any) => ({ ...p, purchase_cost: e.target.value }))} />
          <Input placeholder="Loan EMI (Optional)" value={form.loan_emi} onChange={(e) => setForm((p: any) => ({ ...p, loan_emi: e.target.value }))} />
          <Input type="date" value={form.emi_due_date} onChange={(e) => setForm((p: any) => ({ ...p, emi_due_date: e.target.value }))} />
          <div className="flex gap-2 md:col-span-2 xl:col-span-4">
            <Button type="submit" variant="primary" disabled={busy}>{busy ? "Saving..." : editingId ? "Update Vehicle" : "Add Vehicle"}</Button>
            {editingId ? <Button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</Button> : null}
          </div>
        </form>

        <FilterRow>
          <Input placeholder="Search vehicle no..." />
          <Select defaultValue="all"><option value="all">Status</option></Select>
          <Select defaultValue="all"><option value="all">Vehicle type</option></Select>
          <Input type="date" />
          <Input type="date" />
          <Button>Apply</Button>
        </FilterRow>

        <TableShell
          headers={["Vehicle", "Type", "Fuel", "Capacity(T)", "GPS / FASTag", "Status", "Actions"]}
          rows={rows.map((v) => (
            <tr key={v.id} className="border-t border-slate-100 hover:bg-slate-50/70">
              <td className="px-4 py-3 font-medium">{v.vehicle_no}</td>
              <td className="px-4 py-3">{v.vehicle_type}</td>
              <td className="px-4 py-3">{v.fuel_type || "-"}</td>
              <td className="px-4 py-3">{v.vehicle_capacity_tons || "-"}</td>
              <td className="px-4 py-3">{[v.gps_device_id, v.fastag_id].filter(Boolean).join(" / ") || "-"}</td>
              <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => edit(v)}>Edit</Button>
                  <Button variant="danger" onClick={() => remove(v.id)}>Delete</Button>
                </div>
              </td>
            </tr>
          ))}
          mobileCards={rows.map((v) => (
            <div key={`m-${v.id}`} className="rounded-2xl border border-white/60 bg-white/80 p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">{v.vehicle_no}</p>
                <StatusBadge status={v.status} />
              </div>
              <p className="mt-1 text-sm text-slate-600">{v.vehicle_type} • {v.fuel_type || "-"}</p>
              <p className="mt-1 text-sm text-slate-500">Capacity: {v.vehicle_capacity_tons || "-"}T</p>
              <div className="mt-3 flex gap-2">
                <Button variant="ghost" onClick={() => edit(v)}>Edit</Button>
                <Button variant="danger" onClick={() => remove(v.id)}>Delete</Button>
              </div>
            </div>
          ))}
          emptyTitle="No vehicles"
          emptyMessage="Add your first vehicle to start fleet operations."
        />
        {!rows.length ? <div className="mt-3"><EmptyState title="Vehicle list is empty" message="Vehicle records from DB will be shown here." /></div> : null}
        <PaginationBar summary={`Total vehicles: ${rows.length}`} />
      </Card>
    </div>
  );
}
