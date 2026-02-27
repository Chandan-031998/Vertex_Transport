import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, EmptyState, FilterRow, Input, KpiCard, PaginationBar, Select, TableShell } from "../components/admin/Primitives";
import { http } from "../api/http";

function money(v: any) {
  const n = Number(v || 0);
  return `INR ${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export default function Reports() {
  const [period, setPeriod] = useState("month");
  const [dashboard, setDashboard] = useState<any>(null);
  const [driverTripCount, setDriverTripCount] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = async (p = period) => {
    try {
      const [dashRes, driverRes] = await Promise.all([
        http.get(`/reports/dashboard?period=${p}`),
        http.get("/reports/driver-trip-count"),
      ]);
      setDashboard(dashRes.data?.data || null);
      setDriverTripCount(driverRes.data?.data || []);
      setErr(null);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to load reports");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const expenseTotal = useMemo(
    () => (dashboard?.expense_totals || []).reduce((s: number, x: any) => s + Number(x.total_amount || 0), 0),
    [dashboard]
  );

  return (
    <div className="space-y-4">
      {err ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{err}</div> : null}

      <Card title="Reports & Analytics" subtitle="Operational and financial analytics from live DB data." actions={<Button onClick={() => load()}>Refresh</Button>}>
        <FilterRow>
          <Select value={period} onChange={(e) => { setPeriod(e.target.value); load(e.target.value); }}>
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </Select>
          <Input disabled placeholder="Branch filter (phase-2)" />
          <Input disabled placeholder="Vehicle type filter (phase-2)" />
          <Input type="date" disabled />
          <Input type="date" disabled />
          <Button disabled>Apply</Button>
        </FilterRow>

        <div className="grid gap-3 md:grid-cols-4">
          <KpiCard label="Total Trips" value={String(dashboard?.trips_summary?.total_trips || 0)} trend="Selected period" />
          <KpiCard label="Delivered Trips" value={String(dashboard?.trips_summary?.delivered_trips || 0)} trend="Delivery performance" />
          <KpiCard label="Expense Total" value={money(expenseTotal)} trend="All expense entries" />
          <KpiCard label="Outstanding" value={money(dashboard?.outstanding?.total_outstanding || 0)} trend="Pending customer dues" tone="warning" />
        </div>
      </Card>

      <Card title="Vehicle Utilization">
        <TableShell
          headers={["Vehicle", "Trip Count"]}
          rows={(dashboard?.fleet_utilization || []).map((x: any) => (
            <tr key={x.vehicle_no} className="border-t border-slate-100 hover:bg-slate-50/70">
              <td className="px-4 py-3 font-medium">{x.vehicle_no}</td>
              <td className="px-4 py-3">{x.trip_count}</td>
            </tr>
          ))}
          mobileCards={(dashboard?.fleet_utilization || []).map((x: any) => (
            <div key={`m-${x.vehicle_no}`} className="rounded-2xl border border-white/60 bg-white/80 p-3 shadow-sm">
              <p className="font-semibold text-slate-900">{x.vehicle_no}</p>
              <p className="text-sm text-slate-500">Trips: {x.trip_count}</p>
            </div>
          ))}
          emptyTitle="No utilization records"
          emptyMessage="No utilization data found in DB."
        />
        {!(dashboard?.fleet_utilization || []).length ? <div className="mt-3"><EmptyState title="No utilization data" message="Run trips and this report will populate." /></div> : null}
      </Card>

      <Card title="Expense Analysis">
        <TableShell
          headers={["Expense Type", "Total"]}
          rows={(dashboard?.expense_totals || []).map((x: any) => (
            <tr key={x.expense_type} className="border-t border-slate-100 hover:bg-slate-50/70">
              <td className="px-4 py-3 font-medium">{x.expense_type}</td>
              <td className="px-4 py-3">{money(x.total_amount)}</td>
            </tr>
          ))}
          mobileCards={(dashboard?.expense_totals || []).map((x: any) => (
            <div key={`m-${x.expense_type}`} className="rounded-2xl border border-white/60 bg-white/80 p-3 shadow-sm">
              <p className="font-semibold text-slate-900">{x.expense_type}</p>
              <p className="text-sm text-slate-500">{money(x.total_amount)}</p>
            </div>
          ))}
          emptyTitle="No expense records"
          emptyMessage="No expense data found in DB."
        />
      </Card>

      <Card title="Driver Trip Count">
        <TableShell
          headers={["Driver", "Trip Count"]}
          rows={driverTripCount.map((r: any) => (
            <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50/70">
              <td className="px-4 py-3 font-medium">{r.name}</td>
              <td className="px-4 py-3">{r.trip_count}</td>
            </tr>
          ))}
          mobileCards={driverTripCount.map((r: any) => (
            <div key={`m-${r.id}`} className="rounded-2xl border border-white/60 bg-white/80 p-3 shadow-sm">
              <p className="font-semibold text-slate-900">{r.name}</p>
              <p className="text-sm text-slate-500">Trips: {r.trip_count}</p>
            </div>
          ))}
          emptyTitle="No driver trip data"
          emptyMessage="No driver-trip stats available in DB."
        />
        {!driverTripCount.length ? <div className="mt-3"><EmptyState title="No driver data" message="Driver trip metrics will appear when trips are available." /></div> : null}
        <PaginationBar summary={`Total drivers in report: ${driverTripCount.length}`} />
      </Card>
    </div>
  );
}
