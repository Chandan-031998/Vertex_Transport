import React, { useEffect, useState } from "react";
import { http } from "../api/http";
import { Button, Card, Input, Select, TableShell } from "../components/admin/Primitives";

export default function FleetFuelBreakdowns() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [fuelLogs, setFuelLogs] = useState<any[]>([]);
  const [breakdowns, setBreakdowns] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [fuelForm, setFuelForm] = useState<any>({ vehicle_id: "", log_date: "", odometer: "", liters: "", amount: "" });
  const [breakForm, setBreakForm] = useState<any>({ vehicle_id: "", breakdown_at: "", issue: "", severity: "MEDIUM" });

  const load = async () => {
    try {
      const [v, f, b] = await Promise.all([
        http.get("/fleet/vehicles"),
        http.get("/fleet/fuel-logs"),
        http.get("/fleet/breakdowns"),
      ]);
      setVehicles(v.data?.data || []);
      setFuelLogs(f.data?.data || []);
      setBreakdowns(b.data?.data || []);
      setErr(null);
    } catch (e: any) { setErr(e?.response?.data?.message || "Failed to load data"); }
  };

  useEffect(() => { load(); }, []);

  const addFuel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await http.post("/fleet/fuel-logs", {
        ...fuelForm,
        vehicle_id: Number(fuelForm.vehicle_id),
        odometer: Number(fuelForm.odometer),
        liters: Number(fuelForm.liters),
        amount: Number(fuelForm.amount),
      });
      setFuelForm({ vehicle_id: "", log_date: "", odometer: "", liters: "", amount: "" });
      await load();
    } catch (e: any) { setErr(e?.response?.data?.message || "Create failed"); }
  };

  const addBreak = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await http.post("/fleet/breakdowns", { ...breakForm, vehicle_id: Number(breakForm.vehicle_id) });
      setBreakForm({ vehicle_id: "", breakdown_at: "", issue: "", severity: "MEDIUM" });
      await load();
    } catch (e: any) { setErr(e?.response?.data?.message || "Create failed"); }
  };

  return (
    <div className="space-y-4">
      {err && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Fuel Logs" actions={<Button onClick={load}>Refresh</Button>}>
          <form onSubmit={addFuel} className="mb-3 grid gap-2 md:grid-cols-6">
            <Select value={fuelForm.vehicle_id} onChange={(e) => setFuelForm((p: any) => ({ ...p, vehicle_id: e.target.value }))} required><option value="">Vehicle</option>{vehicles.map((v) => <option key={v.id} value={v.id}>{v.vehicle_no}</option>)}</Select>
            <Input type="date" value={fuelForm.log_date} onChange={(e) => setFuelForm((p: any) => ({ ...p, log_date: e.target.value }))} required />
            <Input placeholder="Odometer" value={fuelForm.odometer} onChange={(e) => setFuelForm((p: any) => ({ ...p, odometer: e.target.value }))} required />
            <Input placeholder="Liters" value={fuelForm.liters} onChange={(e) => setFuelForm((p: any) => ({ ...p, liters: e.target.value }))} required />
            <Input placeholder="Amount" value={fuelForm.amount} onChange={(e) => setFuelForm((p: any) => ({ ...p, amount: e.target.value }))} required />
            <Button type="submit" variant="primary">Add</Button>
          </form>
          <TableShell headers={["Vehicle", "Date", "Liters", "Amount", "Flag"]} rows={fuelLogs.map((f) => (
            <tr key={f.id} className="border-t"><td className="px-4 py-3">{f.vehicle_no}</td><td className="px-4 py-3">{f.log_date}</td><td className="px-4 py-3">{f.liters}</td><td className="px-4 py-3">{f.amount}</td><td className="px-4 py-3">{f.theft_flag ? "YES" : "NO"}</td></tr>
          ))} />
        </Card>

        <Card title="Breakdown Management" actions={<Button onClick={load}>Refresh</Button>}>
          <form onSubmit={addBreak} className="mb-3 grid gap-2 md:grid-cols-5">
            <Select value={breakForm.vehicle_id} onChange={(e) => setBreakForm((p: any) => ({ ...p, vehicle_id: e.target.value }))} required><option value="">Vehicle</option>{vehicles.map((v) => <option key={v.id} value={v.id}>{v.vehicle_no}</option>)}</Select>
            <Input type="datetime-local" value={breakForm.breakdown_at} onChange={(e) => setBreakForm((p: any) => ({ ...p, breakdown_at: e.target.value }))} required />
            <Input placeholder="Issue" value={breakForm.issue} onChange={(e) => setBreakForm((p: any) => ({ ...p, issue: e.target.value }))} required />
            <Select value={breakForm.severity} onChange={(e) => setBreakForm((p: any) => ({ ...p, severity: e.target.value }))}><option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option></Select>
            <Button type="submit" variant="primary">Add</Button>
          </form>
          <TableShell headers={["Vehicle", "Time", "Issue", "Severity", "Status"]} rows={breakdowns.map((b) => (
            <tr key={b.id} className="border-t"><td className="px-4 py-3">{b.vehicle_no}</td><td className="px-4 py-3">{b.breakdown_at}</td><td className="px-4 py-3">{b.issue}</td><td className="px-4 py-3">{b.severity}</td><td className="px-4 py-3">{b.status}</td></tr>
          ))} />
        </Card>
      </div>
    </div>
  );
}
