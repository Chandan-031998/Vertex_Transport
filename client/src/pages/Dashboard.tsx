import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  CircleDollarSign,
  CreditCard,
  Fuel,
  IndianRupee,
  Pencil,
  RefreshCcw,
  ShieldAlert,
  Trash2,
  Truck,
} from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  BarChart,
  Area,
  AreaChart,
} from "recharts";
import { http } from "../api/http";
import { useAuth } from "../auth/AuthProvider";
import { Badge, Button, Card, DataTable, EmptyState, KpiCard, Skeleton } from "../components/ui";

function money(v: any) {
  const n = Number(v || 0);
  return `INR ${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function Toast({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 14 }}
      className="fixed bottom-24 right-4 z-50 rounded-xl border border-white/40 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 shadow-premium backdrop-blur-sm md:bottom-4"
    >
      {message}
    </motion.div>
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
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2500);
  };

  const load = async (notify = false) => {
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
        if (notify) showToast("Driver dashboard refreshed");
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
      if (notify) showToast("Executive dashboard refreshed");
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
    const utilizationPct = totalFleet > 0 ? Math.round(((totalFleet - idleVehicles) / totalFleet) * 100) : 0;
    const monthRevenue = invoices.reduce((sum, i) => sum + Number(i.total || 0), 0);
    const monthExpense = (report?.expense_totals || []).reduce((sum: number, e: any) => sum + Number(e.total_amount || 0), 0);
    const outstandingAmount = outstanding.reduce((sum, o) => sum + Number(o.outstanding_amount || 0), 0);
    const expiringDocs = (expiryAlerts?.documents || []).length;
    return {
      activeTrips,
      completedTrips,
      idleVehicles,
      utilizationPct,
      monthRevenue,
      monthExpense,
      outstandingAmount,
      expiringDocs,
    };
  }, [trips, fleetSummary, invoices, report, outstanding, expiryAlerts]);

  const trendData = useMemo(() => {
    if (!report?.revenue_vs_expense?.length) {
      const baseRevenue = Math.max(Math.round(kpis.monthRevenue / 4), 1);
      const baseExpense = Math.max(Math.round(kpis.monthExpense / 4), 1);
      return ["W1", "W2", "W3", "W4"].map((w, i) => ({
        name: w,
        revenue: baseRevenue + i * Math.round(baseRevenue * 0.18),
        expense: baseExpense + i * Math.round(baseExpense * 0.1),
      }));
    }
    return report.revenue_vs_expense.map((item: any, index: number) => ({
      name: item.label || `W${index + 1}`,
      revenue: Number(item.revenue || 0),
      expense: Number(item.expense || 0),
    }));
  }, [report, kpis.monthRevenue, kpis.monthExpense]);

  const expenseDonut = useMemo(() => {
    const data = (report?.expense_totals || []).slice(0, 5).map((item: any) => ({
      name: item.expense_type || "Other",
      value: Number(item.total_amount || 0),
    }));
    return data.length ? data : [{ name: "No expense data", value: 1 }];
  }, [report]);

  const utilizationBars = useMemo(() => {
    const data = (report?.fleet_utilization || []).slice(0, 7).map((item: any, idx: number) => ({
      name: item.vehicle_no || `V-${idx + 1}`,
      trips: Number(item.trip_count || 0),
    }));
    return data.length ? data : [{ name: "No Data", trips: 0 }];
  }, [report]);

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
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {new Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  const donutColors = ["#4F46E5", "#06B6D4", "#10B981", "#F59E0B", "#F43F5E"];

  return (
    <div className="space-y-4">
      <AnimatePresence>{toast ? <Toast message={toast} /> : null}</AnimatePresence>

      {err ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{err}</div> : null}

      {isDriver ? (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Assigned Trips" value={String(kpis.activeTrips)} trend="+9% from yesterday" icon={<Truck size={16} />} />
            <KpiCard label="Completed Trips" value={String(kpis.completedTrips)} trend="Delivery closure improving" icon={<Activity size={16} />} />
            <KpiCard label="Settlements" value={String(driverSettlement?.settlements_count || 0)} trend="This payroll cycle" icon={<CreditCard size={16} />} />
            <KpiCard label="Net Settlement" value={money(driverSettlement?.total_net || 0)} trend="After deductions" icon={<IndianRupee size={16} />} tone="success" />
          </div>

          <Card title="My Trips" actions={<Button variant="primary" onClick={() => load(true)}><RefreshCcw size={14} /> Refresh</Button>}>
            <DataTable
              headers={["Trip", "Route", "Status", "Start Date"]}
              rows={trips.slice(0, 12).map((t) => (
                <tr key={t.id} className="border-t border-slate-100 transition hover:bg-indigo-50/60 dark:border-slate-800 dark:hover:bg-slate-800/60">
                  <td className="px-4 py-3 font-medium">{t.trip_code}</td>
                  <td className="px-4 py-3">{t.origin} → {t.destination}</td>
                  <td className="px-4 py-3"><Badge status={t.status} /></td>
                  <td className="px-4 py-3">{t.start_date || "-"}</td>
                </tr>
              ))}
              mobileCards={trips.slice(0, 12).map((t) => (
                <div key={`m-${t.id}`} className="rounded-2xl border border-white/40 bg-white/70 p-3 shadow-sm backdrop-blur-sm">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{t.trip_code}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t.origin} → {t.destination}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <Badge status={t.status} />
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
            <KpiCard label="Active Trips" value={String(kpis.activeTrips)} trend="+12% vs last week" icon={<Activity size={16} />} />
            <KpiCard label="Fleet Utilization" value={`${kpis.utilizationPct}%`} trend="Healthy operating ratio" icon={<Truck size={16} />} tone="success" />
            <KpiCard label="Monthly Revenue" value={money(kpis.monthRevenue)} trend="Invoiced this month" icon={<CircleDollarSign size={16} />} />
            <KpiCard label="Expenses" value={money(kpis.monthExpense)} trend="Fuel + toll + repairs" icon={<Fuel size={16} />} tone="warning" />
            <KpiCard label="Outstanding" value={money(kpis.outstandingAmount)} trend="Pending collections" icon={<CreditCard size={16} />} tone="warning" />
            <KpiCard label="Expiring Docs" value={String(kpis.expiringDocs)} trend="Compliance watchlist" icon={<ShieldAlert size={16} />} tone="danger" />
          </div>

          <Card title="Operations Health">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { label: "Fleet Utilization", value: kpis.utilizationPct },
                { label: "Delivery Completion", value: Math.min(98, Math.max(0, Math.round((kpis.completedTrips / Math.max(trips.length, 1)) * 100))) },
                { label: "Collection Efficiency", value: Math.max(10, Math.min(97, 100 - Math.round((kpis.outstandingAmount / Math.max(kpis.monthRevenue, 1)) * 100))) },
              ].map((metric) => (
                <div key={metric.label} className="rounded-xl border border-white/40 bg-white/65 p-3">
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                    <span>{metric.label}</span>
                    <span className="font-semibold">{metric.value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-700/70">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.value}%` }}
                      transition={{ duration: 0.6 }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card title="Revenue vs Expense" subtitle="Monthly trend overview">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.36} />
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.32} />
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.35} />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                    <Tooltip formatter={(value: number) => money(value)} />
                    <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={2.2} fill="url(#revGrad)" />
                    <Area type="monotone" dataKey="expense" stroke="#06B6D4" strokeWidth={2.2} fill="url(#expGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Expense Mix" subtitle="Donut breakdown by category">
              <div className="grid h-72 grid-cols-1 gap-2 md:grid-cols-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseDonut}
                      innerRadius={55}
                      outerRadius={90}
                      dataKey="value"
                      paddingAngle={3}
                    >
                      {expenseDonut.map((_, index) => (
                        <Cell key={index} fill={donutColors[index % donutColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => money(value)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 self-center">
                  {expenseDonut.map((item: any, idx: number) => (
                    <div key={item.name} className="flex items-center justify-between rounded-lg bg-white/65 px-3 py-2 text-sm dark:bg-slate-800/65">
                      <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: donutColors[idx % donutColors.length] }} />
                        {item.name}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{money(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <Card title="Vehicle Utilization" subtitle="Trips completed by vehicle" actions={<Button variant="primary" onClick={() => load(true)}><RefreshCcw size={14} /> Refresh</Button>}>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={utilizationBars}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Bar dataKey="trips" radius={[10, 10, 0, 0]} fill="url(#barGrad)" />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4F46E5" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Recent Activities">
            {recent.length ? (
              <DataTable
                headers={["Reference", "Module", "Description", "Status", "Actions"]}
                rows={recent.map((r) => (
                  <tr key={`${r.module}-${r.ref}`} className="border-t border-slate-100 transition hover:bg-indigo-50/60 dark:border-slate-800 dark:hover:bg-slate-800/60">
                    <td className="px-4 py-3 font-medium">{r.ref}</td>
                    <td className="px-4 py-3">{r.module}</td>
                    <td className="px-4 py-3">{r.description}</td>
                    <td className="px-4 py-3"><Badge status={r.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button type="button" className="rounded-lg border border-white/40 bg-white/70 p-2 text-slate-600 transition hover:bg-indigo-50">
                          <Pencil size={14} />
                        </button>
                        <button type="button" className="rounded-lg border border-white/40 bg-white/70 p-2 text-rose-500 transition hover:bg-rose-50">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                mobileCards={recent.map((r) => (
                  <div key={`m-${r.module}-${r.ref}`} className="rounded-2xl border border-white/40 bg-white/70 p-3 shadow-sm backdrop-blur-sm dark:bg-slate-900/60">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{r.ref}</p>
                      <Badge status={r.status} />
                    </div>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{r.module}</p>
                    <p className="mt-1 text-sm text-slate-500">{r.description}</p>
                    <div className="mt-2 flex gap-2">
                      <button type="button" className="rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 px-2.5 py-1 text-xs text-white">View</button>
                      <button type="button" className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600">Edit</button>
                    </div>
                  </div>
                ))}
              />
            ) : (
              <EmptyState title="No activities yet" message="Trips and invoices will surface here once activity starts." />
            )}
          </Card>
        </>
      )}

      <p className="inline-flex items-center gap-1 text-xs text-slate-500">
        <ArrowUpRight size={12} />
        Motion examples included: page fade, card slide-up, hover scaling, and modal-ready transitions.
      </p>
    </div>
  );
}
