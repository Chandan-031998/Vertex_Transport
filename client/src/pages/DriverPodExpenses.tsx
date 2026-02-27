import React, { useEffect, useState } from "react";
import { http } from "../api/http";
import { Button, Card, Input, Select, StatusBadge, TableShell } from "../components/admin/Primitives";

export default function DriverPodExpenses() {
  const [trips, setTrips] = useState<any[]>([]);
  const [tripId, setTripId] = useState<string>("");
  const [pods, setPods] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [expenseForm, setExpenseForm] = useState<any>({ expense_type: "DIESEL", amount: "", note: "" });
  const [podFile, setPodFile] = useState<File | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const loadTrips = async () => {
    const res = await http.get("/trips");
    const rows = res.data?.data || [];
    setTrips(rows);
    if (!tripId && rows[0]) setTripId(String(rows[0].id));
  };

  const loadModules = async (id: string) => {
    if (!id) return;
    const [p, e] = await Promise.all([http.get(`/trips/${id}/pods`), http.get(`/trips/${id}/expenses`)]);
    setPods(p.data?.data || []);
    setExpenses(e.data?.data || []);
  };

  const load = async () => {
    try {
      await loadTrips();
      setErr(null);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Load failed");
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { if (tripId) loadModules(tripId).catch((e: any) => setErr(e?.response?.data?.message || "Load failed")); }, [tripId]);

  const submitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId) return;
    try {
      await http.post(`/trips/${tripId}/expenses`, {
        expense_type: expenseForm.expense_type,
        amount: Number(expenseForm.amount),
        note: expenseForm.note || null,
      });
      setExpenseForm({ expense_type: "DIESEL", amount: "", note: "" });
      await loadModules(tripId);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Expense submit failed");
    }
  };

  const submitPod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId || !podFile) return;
    try {
      const form = new FormData();
      form.append("file", podFile);
      await http.post(`/trips/${tripId}/pods`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPodFile(null);
      await loadModules(tripId);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "POD upload failed");
    }
  };

  return (
    <div className="space-y-4">
      {err && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      <Card title="POD Upload & Trip Expenses" actions={<Button onClick={load}>Refresh</Button>}>
        <div className="mb-4 max-w-sm">
          <Select value={tripId} onChange={(e) => setTripId(e.target.value)}>
            <option value="">Select trip</option>
            {trips.map((t) => <option key={t.id} value={t.id}>{t.trip_code}</option>)}
          </Select>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <h4 className="mb-2 font-semibold">Submit Expense</h4>
            <form onSubmit={submitExpense} className="mb-3 grid gap-2 md:grid-cols-3">
              <Select value={expenseForm.expense_type} onChange={(e) => setExpenseForm((p: any) => ({ ...p, expense_type: e.target.value }))}>
                <option value="DIESEL">DIESEL</option>
                <option value="TOLL">TOLL</option>
                <option value="FOOD">FOOD</option>
                <option value="REPAIR">REPAIR</option>
                <option value="OTHER">OTHER</option>
              </Select>
              <Input placeholder="Amount" value={expenseForm.amount} onChange={(e) => setExpenseForm((p: any) => ({ ...p, amount: e.target.value }))} required />
              <Input placeholder="Note" value={expenseForm.note} onChange={(e) => setExpenseForm((p: any) => ({ ...p, note: e.target.value }))} />
              <Button type="submit" variant="primary">Submit</Button>
            </form>
            <TableShell headers={["Type", "Amount", "Status"]} rows={expenses.map((x) => (
              <tr key={x.id} className="border-t"><td className="px-4 py-3">{x.expense_type}</td><td className="px-4 py-3">{x.amount}</td><td className="px-4 py-3"><StatusBadge status={x.approval_status || "PENDING"} /></td></tr>
            ))} />
          </div>
          <div>
            <h4 className="mb-2 font-semibold">Upload POD</h4>
            <form onSubmit={submitPod} className="mb-3 flex flex-wrap items-center gap-2">
              <Input type="file" onChange={(e) => setPodFile(e.target.files?.[0] || null)} required />
              <Button type="submit" variant="primary">Upload</Button>
            </form>
            <TableShell headers={["File", "Status"]} rows={pods.map((p) => (
              <tr key={p.id} className="border-t"><td className="px-4 py-3">{p.file_path}</td><td className="px-4 py-3"><StatusBadge status={p.approval_status || "PENDING"} /></td></tr>
            ))} />
          </div>
        </div>
      </Card>
    </div>
  );
}

