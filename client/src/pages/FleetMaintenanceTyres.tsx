import React, { useEffect, useState } from "react";
import { http } from "../api/http";
import { Button, Card, Input, Select, TableShell } from "../components/admin/Primitives";

export default function FleetMaintenanceTyres() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [tyres, setTyres] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [maintenanceForm, setMaintenanceForm] = useState<any>({ vehicle_id: "", service_type: "", due_date: "" });
  const [tyreForm, setTyreForm] = useState<any>({ vehicle_id: "", tyre_code: "", position_code: "", installed_on: "" });

  const load = async () => {
    try {
      const [v, m, t] = await Promise.all([
        http.get("/fleet/vehicles"),
        http.get("/fleet/maintenance"),
        http.get("/fleet/tyres"),
      ]);
      setVehicles(v.data?.data || []);
      setMaintenance(m.data?.data || []);
      setTyres(t.data?.data || []);
      setErr(null);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to load data");
    }
  };

  useEffect(() => { load(); }, []);

  const addMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await http.post("/fleet/maintenance", { ...maintenanceForm, vehicle_id: Number(maintenanceForm.vehicle_id) });
      setMaintenanceForm({ vehicle_id: "", service_type: "", due_date: "" });
      await load();
    } catch (e: any) { setErr(e?.response?.data?.message || "Create failed"); }
  };

  const addTyre = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await http.post("/fleet/tyres", { ...tyreForm, vehicle_id: Number(tyreForm.vehicle_id) });
      setTyreForm({ vehicle_id: "", tyre_code: "", position_code: "", installed_on: "" });
      await load();
    } catch (e: any) { setErr(e?.response?.data?.message || "Create failed"); }
  };

  return (
    <div className="space-y-4">
      {err && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Service & Maintenance Schedule" actions={<Button onClick={load}>Refresh</Button>}>
          <form onSubmit={addMaintenance} className="mb-3 grid gap-2 md:grid-cols-4">
            <Select value={maintenanceForm.vehicle_id} onChange={(e) => setMaintenanceForm((p: any) => ({ ...p, vehicle_id: e.target.value }))} required>
              <option value="">Vehicle</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.vehicle_no}</option>)}
            </Select>
            <Input placeholder="Service type" value={maintenanceForm.service_type} onChange={(e) => setMaintenanceForm((p: any) => ({ ...p, service_type: e.target.value }))} required />
            <Input type="date" value={maintenanceForm.due_date} onChange={(e) => setMaintenanceForm((p: any) => ({ ...p, due_date: e.target.value }))} required />
            <Button type="submit" variant="primary">Add</Button>
          </form>
          <TableShell headers={["Vehicle", "Service", "Due", "Status"]} rows={maintenance.map((m) => (
            <tr key={m.id} className="border-t"><td className="px-4 py-3">{m.vehicle_no}</td><td className="px-4 py-3">{m.service_type}</td><td className="px-4 py-3">{m.due_date}</td><td className="px-4 py-3">{m.status}</td></tr>
          ))} />
          {!maintenance.length && <div className="mt-2 text-sm text-slate-500">No schedules in DB.</div>}
        </Card>

        <Card title="Tyre Lifecycle" actions={<Button onClick={load}>Refresh</Button>}>
          <form onSubmit={addTyre} className="mb-3 grid gap-2 md:grid-cols-5">
            <Select value={tyreForm.vehicle_id} onChange={(e) => setTyreForm((p: any) => ({ ...p, vehicle_id: e.target.value }))} required>
              <option value="">Vehicle</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.vehicle_no}</option>)}
            </Select>
            <Input placeholder="Tyre code" value={tyreForm.tyre_code} onChange={(e) => setTyreForm((p: any) => ({ ...p, tyre_code: e.target.value }))} required />
            <Input placeholder="Position" value={tyreForm.position_code} onChange={(e) => setTyreForm((p: any) => ({ ...p, position_code: e.target.value }))} required />
            <Input type="date" value={tyreForm.installed_on} onChange={(e) => setTyreForm((p: any) => ({ ...p, installed_on: e.target.value }))} required />
            <Button type="submit" variant="primary">Add</Button>
          </form>
          <TableShell headers={["Vehicle", "Tyre", "Position", "Status"]} rows={tyres.map((t) => (
            <tr key={t.id} className="border-t"><td className="px-4 py-3">{t.vehicle_no}</td><td className="px-4 py-3">{t.tyre_code}</td><td className="px-4 py-3">{t.position_code}</td><td className="px-4 py-3">{t.status}</td></tr>
          ))} />
          {!tyres.length && <div className="mt-2 text-sm text-slate-500">No tyres in DB.</div>}
        </Card>
      </div>
    </div>
  );
}
