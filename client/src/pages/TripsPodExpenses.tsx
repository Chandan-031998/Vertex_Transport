import React, { useEffect, useState } from "react";
import { http } from "../api/http";
import { Button, Card, Select, StatusBadge, TableShell } from "../components/admin/Primitives";

export default function TripsPodExpenses() {
  const [trips, setTrips] = useState<any[]>([]);
  const [tripId, setTripId] = useState<string>("");
  const [pods, setPods] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const loadTrips = async () => {
    const res = await http.get("/trips");
    const rows = res.data?.data || [];
    setTrips(rows);
    if (!tripId && rows[0]) setTripId(String(rows[0].id));
  };

  const loadData = async (id: string) => {
    if (!id) return;
    const [p, e] = await Promise.all([http.get(`/trips/${id}/pods`), http.get(`/trips/${id}/expenses`)]);
    setPods(p.data?.data || []);
    setExpenses(e.data?.data || []);
  };

  const load = async () => {
    try { await loadTrips(); setErr(null); } catch (e: any) { setErr(e?.response?.data?.message || "Load failed"); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { if (tripId) loadData(tripId).catch((e: any) => setErr(e?.response?.data?.message || "Load failed")); }, [tripId]);

  const reviewPod = async (podId: number, status: "APPROVED" | "REJECTED") => {
    try { await http.put(`/trips/${tripId}/pods/${podId}/review`, { status }); await loadData(tripId); } catch (e: any) { setErr(e?.response?.data?.message || "Review failed"); }
  };
  const reviewExpense = async (expenseId: number, status: "APPROVED" | "REJECTED") => {
    try { await http.put(`/trips/${tripId}/expenses/${expenseId}/review`, { status }); await loadData(tripId); } catch (e: any) { setErr(e?.response?.data?.message || "Review failed"); }
  };

  return (
    <div className="space-y-4">
      {err && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      <Card title="POD & Expenses" actions={<Button onClick={load}>Refresh</Button>}>
        <div className="mb-4 max-w-sm"><Select value={tripId} onChange={(e) => setTripId(e.target.value)}><option value="">Select trip</option>{trips.map((t) => <option key={t.id} value={t.id}>{t.trip_code}</option>)}</Select></div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <h4 className="mb-2 font-semibold">POD Approval</h4>
            <TableShell headers={["File", "Status", "Actions"]} rows={pods.map((p) => (
              <tr key={p.id} className="border-t"><td className="px-4 py-3">{p.file_path}</td><td className="px-4 py-3"><StatusBadge status={p.approval_status || "PENDING"} /></td><td className="px-4 py-3"><div className="flex gap-2"><button className="enterprise-btn" onClick={() => reviewPod(p.id, "APPROVED")}>Approve</button><button className="enterprise-btn" onClick={() => reviewPod(p.id, "REJECTED")}>Reject</button></div></td></tr>
            ))} />
          </div>
          <div>
            <h4 className="mb-2 font-semibold">Expense Approval</h4>
            <TableShell headers={["Type", "Amount", "Status", "Actions"]} rows={expenses.map((x) => (
              <tr key={x.id} className="border-t"><td className="px-4 py-3">{x.expense_type}</td><td className="px-4 py-3">{x.amount}</td><td className="px-4 py-3"><StatusBadge status={x.approval_status || "PENDING"} /></td><td className="px-4 py-3"><div className="flex gap-2"><button className="enterprise-btn" onClick={() => reviewExpense(x.id, "APPROVED")}>Approve</button><button className="enterprise-btn" onClick={() => reviewExpense(x.id, "REJECTED")}>Reject</button></div></td></tr>
            ))} />
          </div>
        </div>
      </Card>
    </div>
  );
}
