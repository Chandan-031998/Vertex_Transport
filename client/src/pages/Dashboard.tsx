import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, EmptyState, KpiCard, StatusBadge, TableShell } from "../components/admin/Primitives";
import { http } from "../api/http";
import { useAuth } from "../auth/AuthProvider";

function money(v: any) {
  const n = Number(v || 0);
  return `INR ${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function TinyBars({ values, tone = "bg-blue-600" }: { values: number[]; tone?: string }) {
  const max = Math.max(...values, 1);
  if (!values.length) return <EmptyState title="No chart data" message="Data will appear once records are available." />;
  return (
    <div className="flex h-36 items-end gap-2">
      {values.map((value, idx) => (
        <div key={`${value}-${idx}`} className={`w-full rounded-t-xl ${tone}`} style={{ height: `${(value / max) * 100}%` }} />
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const isDriver = user?.role === "DRIVER";
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [outstanding, setOutstanding] = useState<any[]>([]);
  const [fleetSummary, setFleetSummary] = useState<any>(null);
  const [expiryAlerts, setExpiryAlerts] = useState<any>({ documents: [] });
  const [report, setReport] = useState<any>(null);
  const [driverSettlement, setDriverSettlement] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      if (isDriver) {
        const [tripsRes, settlementRes] = await Promise.all([
          http.get("/trips"),
          http.get("/drivers/me/settlements/summary"),
        ]);
        setTrips(tripsRes.data?.data || []);
        setDriverSettlement(settlementRes.data?.data || null);
        setInvoices([]);
        setOutstanding([]);
        setFleetSummary(null);
        setExpiryAlerts({ documents: [] });
        setReport(null);
        setErr(null);
        return;
      }
      const [tripsRes, invoicesRes, outstandingRes, fleetRes, expiryRes, reportRes] = await Promise.all([
        http.get("/trips"),
        http.get("/billing/invoices"),
        http.get("/billing/invoices/outstanding"),
        http.get("/fleet/summary"),
        http.get("/fleet/alerts/expiry?days=30"),
        http.get("/reports/dashboard?period=month"),
      ]);
      setTrips(tripsRes.data?.data || []);
      setInvoices(invoicesRes.data?.data || []);
      setOutstanding(outstandingRes.data?.data || []);
      setFleetSummary(fleetRes.data?.data || null);
      setExpiryAlerts(expiryRes.data?.data || { documents: [] });
      setReport(reportRes.data?.data || null);
      setDriverSettlement(null);
      setErr(null);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [isDriver]);

  const kpis = useMemo(() => {
    const activeTrips = trips.filter((t) => ["ASSIGNED", "STARTED", "IN_TRANSIT"].includes(t.status)).length;
    const completedTrips = trips.filter((t) => ["DELIVERED", "POD_SUBMITTED", "CLOSED", "SETTLED"].includes(t.status)).length;
    const idleVehicles = Number(fleetSummary?.idle_fleet || 0);
    const totalFleet = Number(fleetSummary?.total_fleet || 0);
    const utilization = totalFleet > 0 ? `${Math.round(((totalFleet - idleVehicles) / totalFleet) * 100)}%` : "0%";
    const monthRevenue = invoices.reduce((sum, i) => sum + Number(i.total || 0), 0);
    const monthExpense = (report?.expense_totals || []).reduce((sum: number, e: any) => sum + Number(e.total_amount || 0), 0);
    const outstandingAmount = outstanding.reduce((sum, o) => sum + Number(o.outstanding_amount || 0), 0);
    const expiringDocs = (expiryAlerts?.documents || []).length;
    return { activeTrips, completedTrips, idleVehicles, utilization, monthRevenue, monthExpense, outstandingAmount, expiringDocs };
  }, [trips, fleetSummary, invoices, report, outstanding, expiryAlerts]);

  const recent = useMemo(() => {
    const tripRows = trips.slice(0, 5).map((t) => ({
      ref: t.trip_code,
      module: "Trips",
      description: `${t.origin} to ${t.destination}`,
      status: t.status,
    }));
    const invoiceRows = invoices.slice(0, 5).map((i) => ({
      ref: i.invoice_no,
      module: "Billing",
      description: `Invoice for ${i.customer_name || "Customer"}`,
      status: i.status,
    }));
    return [...tripRows, ...invoiceRows].slice(0, 10);
  }, [trips, invoices]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {new Array(6).fill(0).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-3xl bg-slate-200/70" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {err ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{err}</div> : null}

      {isDriver ? (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Assigned Trips" value={String(kpis.activeTrips)} trend="Live from assigned trip records" />
            <KpiCard label="Past Trips" value={String(kpis.completedTrips)} trend="Delivered + closed trips" />
            <KpiCard label="Total Settlements" value={String(driverSettlement?.settlements_count || 0)} trend="Captured from settlement entries" />
            <KpiCard label="Net Settlement" value={money(driverSettlement?.total_net || 0)} trend="After advances and deductions" />
          </div>

          <Card title="My Recent Trips" actions={<Button onClick={load}>Refresh</Button>}>
            <TableShell
              headers={["Trip", "Route", "Status", "Start Date"]}
              rows={trips.slice(0, 12).map((t) => (
                <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-medium">{t.trip_code}</td>
                  <td className="px-4 py-3">{t.origin} → {t.destination}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3">{t.start_date || "-"}</td>
                </tr>
              ))}
              mobileCards={trips.slice(0, 12).map((t) => (
                <div key={`m-${t.id}`} className="rounded-2xl border border-white/60 bg-white/80 p-3 shadow-sm">
                  <p className="font-semibold text-slate-900">{t.trip_code}</p>
                  <p className="mt-1 text-sm text-slate-600">{t.origin} → {t.destination}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <StatusBadge status={t.status} />
                    <span className="text-xs text-slate-500">{t.start_date || "-"}</span>
                  </div>
                </div>
              ))}
              emptyTitle="No trips assigned"
              emptyMessage="Assigned trips will appear here."
            />
          </Card>
        </>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <KpiCard label="Active Trips" value={String(kpis.activeTrips)} trend="Operational trips right now" />
            <KpiCard label="Fleet Utilization" value={kpis.utilization} trend="Based on active vs idle fleet" />
            <KpiCard label="Monthly Revenue" value={money(kpis.monthRevenue)} trend="Invoices generated this month" />
            <KpiCard label="Expenses" value={money(kpis.monthExpense)} trend="Trip expenses posted" />
            <KpiCard label="Outstanding" value={money(kpis.outstandingAmount)} trend="Pending collections" tone="warning" />
            <KpiCard label="Expiring Documents" value={String(kpis.expiringDocs)} trend="Next 30 days" tone="danger" />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card title="Vehicle Utilization">
              <TinyBars values={(report?.fleet_utilization || []).slice(0, 8).map((x: any) => Number(x.trip_count || 0))} />
            </Card>
            <Card title="Expense Breakdown">
              <TinyBars values={(report?.expense_totals || []).slice(0, 8).map((x: any) => Number(x.total_amount || 0))} tone="bg-emerald-600" />
            </Card>
          </div>

          <Card title="Recent Activities" actions={<Button onClick={load}>Refresh</Button>}>
            <TableShell
              headers={["Reference", "Module", "Description", "Status", "Action"]}
              rows={recent.map((r) => (
                <tr key={`${r.module}-${r.ref}`} className="border-t border-slate-100 hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-medium">{r.ref}</td>
                  <td className="px-4 py-3">{r.module}</td>
                  <td className="px-4 py-3">{r.description}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3"><Button variant="ghost">View</Button></td>
                </tr>
              ))}
              mobileCards={recent.map((r) => (
                <div key={`m-${r.module}-${r.ref}`} className="rounded-2xl border border-white/60 bg-white/80 p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900">{r.ref}</p>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{r.module}</p>
                  <p className="mt-1 text-sm text-slate-500">{r.description}</p>
                </div>
              ))}
              emptyTitle="No activities yet"
              emptyMessage="Trips and invoices from DB appear here."
            />
          </Card>
        </>
      )}
    </div>
  );
}
