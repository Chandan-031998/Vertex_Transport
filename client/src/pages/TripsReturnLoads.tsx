import React, { useEffect, useState } from "react";
import { http } from "../api/http";
import { Card, TableShell } from "../components/admin/Primitives";

export default function TripsReturnLoads() {
  const [rows, setRows] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await http.get("/trips");
      const delivered = (res.data?.data || []).filter((t: any) => ["DELIVERED", "CLOSED", "SETTLED"].includes(t.status));
      setRows(delivered);
      setErr(null);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to load trips");
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      {err && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      <Card title="Return Load Management">
        <TableShell headers={["Trip", "Route", "Status"]} rows={rows.map((t: any) => (
          <tr key={t.id} className="border-t"><td className="px-4 py-3">{t.trip_code}</td><td className="px-4 py-3">{t.origin} → {t.destination}</td><td className="px-4 py-3">{t.status}</td></tr>
        ))} />
        {!rows.length && <div className="mt-3 text-sm text-slate-500">No delivered/closed trips in DB for return-load planning.</div>}
      </Card>
    </div>
  );
}
