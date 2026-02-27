import React, { useEffect, useState } from "react";
import { http } from "../api/http";
import { Card, KpiCard, Button } from "../components/admin/Primitives";

function money(v: any) {
  const n = Number(v || 0);
  return `INR ${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export default function DriverSettlements() {
  const [summary, setSummary] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await http.get("/drivers/me/settlements/summary");
      setSummary(res.data?.data || null);
      setErr(null);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to load settlement summary");
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      {err && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      <Card title="Settlement Summary" actions={<Button onClick={load}>Refresh</Button>}>
        <div className="grid gap-3 md:grid-cols-3">
          <KpiCard label="Settlements" value={String(summary?.settlements_count || 0)} />
          <KpiCard label="Total Gross" value={money(summary?.total_gross)} />
          <KpiCard label="Total Net" value={money(summary?.total_net)} />
          <KpiCard label="Advance Deduction" value={money(summary?.total_deduction)} />
          <KpiCard label="Open Advances" value={money(summary?.open_advance_amount)} />
          <KpiCard label="Pending Commission" value={money(summary?.pending_commission)} />
        </div>
      </Card>
    </div>
  );
}

