import React, { useEffect, useState } from "react";
import { http } from "../api/http";
import { Button, Card, Input, Select, TableShell } from "../components/admin/Primitives";

export default function DriversSettlementsPerformance() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [driverId, setDriverId] = useState<string>("");
  const [settlements, setSettlements] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [settleForm, setSettleForm] = useState<any>({ settlement_date: "", gross_amount: "", advance_deduction: "" });
  const [perfForm, setPerfForm] = useState<any>({ period_from: "", period_to: "" });

  const loadDrivers = async () => {
    const res = await http.get("/drivers");
    const rows = res.data?.data || [];
    setDrivers(rows);
    if (!driverId && rows[0]) setDriverId(String(rows[0].id));
  };

  const loadModules = async (id: string) => {
    if (!id) return;
    const [s, p] = await Promise.all([
      http.get(`/drivers/${id}/settlements`),
      http.get(`/drivers/${id}/performance`),
    ]);
    setSettlements(s.data?.data || []);
    setPerformance(p.data?.data || []);
  };

  const load = async () => {
    try {
      await loadDrivers();
      setErr(null);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to load data");
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { if (driverId) loadModules(driverId).catch((e: any) => setErr(e?.response?.data?.message || "Load failed")); }, [driverId]);

  const saveSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await http.post("/drivers/settlements", { driver_id: Number(driverId), settlement_date: settleForm.settlement_date, gross_amount: Number(settleForm.gross_amount), advance_deduction: Number(settleForm.advance_deduction || 0) });
      setSettleForm({ settlement_date: "", gross_amount: "", advance_deduction: "" });
      await loadModules(driverId);
    } catch (e: any) { setErr(e?.response?.data?.message || "Save failed"); }
  };

  const generatePerf = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await http.post("/drivers/performance/generate", { driver_id: Number(driverId), period_from: perfForm.period_from, period_to: perfForm.period_to });
      setPerfForm({ period_from: "", period_to: "" });
      await loadModules(driverId);
    } catch (e: any) { setErr(e?.response?.data?.message || "Generate failed"); }
  };

  return (
    <div className="space-y-4">
      {err && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      <Card title="Settlements & Performance" actions={<Button onClick={load}>Refresh</Button>}>
        <div className="mb-4 max-w-sm"><Select value={driverId} onChange={(e) => setDriverId(e.target.value)}><option value="">Select driver</option>{drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</Select></div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <h4 className="mb-2 font-semibold">Advance & Settlement</h4>
            <form onSubmit={saveSettlement} className="mb-3 grid gap-2 md:grid-cols-4">
              <Input type="date" value={settleForm.settlement_date} onChange={(e) => setSettleForm((p: any) => ({ ...p, settlement_date: e.target.value }))} required />
              <Input placeholder="Gross" value={settleForm.gross_amount} onChange={(e) => setSettleForm((p: any) => ({ ...p, gross_amount: e.target.value }))} required />
              <Input placeholder="Advance deduction" value={settleForm.advance_deduction} onChange={(e) => setSettleForm((p: any) => ({ ...p, advance_deduction: e.target.value }))} />
              <Button type="submit" variant="primary">Create</Button>
            </form>
            <TableShell headers={["Date", "Gross", "Net"]} rows={settlements.map((s) => (
              <tr key={s.id} className="border-t"><td className="px-4 py-3">{s.settlement_date}</td><td className="px-4 py-3">{s.gross_amount}</td><td className="px-4 py-3">{s.net_amount}</td></tr>
            ))} />
          </div>

          <div>
            <h4 className="mb-2 font-semibold">Performance Scoring</h4>
            <form onSubmit={generatePerf} className="mb-3 grid gap-2 md:grid-cols-3">
              <Input type="date" value={perfForm.period_from} onChange={(e) => setPerfForm((p: any) => ({ ...p, period_from: e.target.value }))} required />
              <Input type="date" value={perfForm.period_to} onChange={(e) => setPerfForm((p: any) => ({ ...p, period_to: e.target.value }))} required />
              <Button type="submit" variant="primary">Generate</Button>
            </form>
            <TableShell headers={["Period", "Overall Score"]} rows={performance.map((p) => (
              <tr key={p.id} className="border-t"><td className="px-4 py-3">{p.period_from} to {p.period_to}</td><td className="px-4 py-3">{Number(p.overall_score || 0).toFixed(2)}</td></tr>
            ))} />
          </div>
        </div>
      </Card>
    </div>
  );
}
