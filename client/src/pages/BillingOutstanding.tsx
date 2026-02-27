import React, { useEffect, useState } from "react";
import { http } from "../api/http";
import { Card, StatusBadge, TableShell } from "../components/admin/Primitives";

export default function BillingOutstanding() {
  const [rows, setRows] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await http.get("/billing/invoices/outstanding");
      setRows(res.data?.data || []);
      setErr(null);
    } catch (e: any) { setErr(e?.response?.data?.message || "Failed to load outstanding"); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      {err && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      <Card title="Outstanding Payments">
        <TableShell headers={["Invoice", "Customer", "Outstanding", "Status"]} rows={rows.map((r) => (
          <tr key={r.id} className="border-t"><td className="px-4 py-3">{r.invoice_no}</td><td className="px-4 py-3">{r.customer_name}</td><td className="px-4 py-3">{r.outstanding_amount}</td><td className="px-4 py-3"><StatusBadge status={r.status} /></td></tr>
        ))} />
      </Card>
    </div>
  );
}
