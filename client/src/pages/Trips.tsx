import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, EmptyState, FilterRow, Input, KpiCard, PaginationBar, Select, StatusBadge, TableShell } from "../components/admin/Primitives";
import { http } from "../api/http";

type Trip = {
  id: number;
  trip_code: string;
  origin: string;
  destination: string;
  vehicle_id: number | null;
  driver_id: number | null;
  status: string;
};

const emptyForm = { trip_code: "", origin: "", destination: "", vehicle_id: "", driver_id: "", start_date: "", end_date: "" };
const tripSteps = ["ASSIGNED", "STARTED", "IN_TRANSIT", "DELIVERED", "CLOSED"];

export default function Trips() {
  const [rows, setRows] = useState<Trip[]>([]);
  const [form, setForm] = useState<any>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await http.get("/trips");
      setRows(res.data?.data || []);
      setErr(null);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to load trips");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const kpis = useMemo(() => {
    const active = rows.filter((x) => ["ASSIGNED", "STARTED", "IN_TRANSIT"].includes(x.status)).length;
    const closed = rows.filter((x) => ["DELIVERED", "CLOSED", "SETTLED"].includes(x.status)).length;
    return { active, closed };
  }, [rows]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        trip_code: form.trip_code,
        origin: form.origin,
        destination: form.destination,
        vehicle_id: form.vehicle_id ? Number(form.vehicle_id) : null,
        driver_id: form.driver_id ? Number(form.driver_id) : null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      };
      if (editingId) {
        await http.put(`/trips/${editingId}`, {
          vehicle_id: payload.vehicle_id,
          driver_id: payload.driver_id,
          start_date: payload.start_date,
          end_date: payload.end_date,
          status: form.status || "PLANNED",
        });
      } else {
        await http.post("/trips", payload);
      }
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (e: any) {
      const details = e?.response?.data?.details;
      const detailMsg = Array.isArray(details) ? details[0]?.message : null;
      setErr(detailMsg || e?.response?.data?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const edit = (t: Trip) => {
    setEditingId(t.id);
    setForm({
      trip_code: t.trip_code,
      origin: t.origin,
      destination: t.destination,
      vehicle_id: t.vehicle_id || "",
      driver_id: t.driver_id || "",
      start_date: "",
      end_date: "",
      status: t.status,
    });
  };

  const remove = async (id: number) => {
    if (!window.confirm("Delete trip?")) return;
    try {
      await http.delete(`/trips/${id}`);
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <KpiCard label="Active Trips" value={String(kpis.active)} trend="ASSIGNED / STARTED / IN_TRANSIT" />
        <KpiCard label="Closed Trips" value={String(kpis.closed)} trend="DELIVERED / CLOSED / SETTLED" />
      </div>

      <Card title="Trip Lifecycle" subtitle="ASSIGNED → STARTED → IN TRANSIT → DELIVERED → CLOSED">
        <div className="flex flex-wrap items-center gap-2">
          {tripSteps.map((step, index) => (
            <React.Fragment key={step}>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">{step.replace("_", " ")}</span>
              {index < tripSteps.length - 1 ? <span className="text-slate-300">→</span> : null}
            </React.Fragment>
          ))}
        </div>
      </Card>

      <Card title="Trip Planning & Allocation" subtitle="Create, assign, and update trip plans." actions={<Button onClick={load}>Refresh</Button>}>
        {err ? <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">{err}</div> : null}

        <form onSubmit={submit} className="mb-4 grid gap-2 md:grid-cols-2 xl:grid-cols-7">
          <Input placeholder="Trip Code" value={form.trip_code} onChange={(e) => setForm((p: any) => ({ ...p, trip_code: e.target.value }))} required disabled={!!editingId} />
          <Input placeholder="Origin" value={form.origin} onChange={(e) => setForm((p: any) => ({ ...p, origin: e.target.value }))} required={!editingId} />
          <Input placeholder="Destination" value={form.destination} onChange={(e) => setForm((p: any) => ({ ...p, destination: e.target.value }))} required={!editingId} />
          <Input placeholder="Vehicle ID" value={form.vehicle_id} onChange={(e) => setForm((p: any) => ({ ...p, vehicle_id: e.target.value }))} />
          <Input placeholder="Driver ID" value={form.driver_id} onChange={(e) => setForm((p: any) => ({ ...p, driver_id: e.target.value }))} />
          <Input type="date" value={form.start_date} onChange={(e) => setForm((p: any) => ({ ...p, start_date: e.target.value }))} />
          <div className="flex gap-2">
            <Button type="submit" variant="primary" disabled={busy}>{busy ? "Saving..." : editingId ? "Update" : "Create"}</Button>
            {editingId ? <Button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</Button> : null}
          </div>
        </form>

        <FilterRow>
          <Input placeholder="Search trip code..." />
          <Select defaultValue="all"><option value="all">Status</option></Select>
          <Input type="date" />
          <Input type="date" />
          <Button>Apply</Button>
          <Button>Export</Button>
        </FilterRow>

        <TableShell
          headers={["Trip", "Route", "Vehicle", "Driver", "Status", "Actions"]}
          rows={rows.map((t) => (
            <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50/70">
              <td className="px-4 py-3 font-medium">{t.trip_code}</td>
              <td className="px-4 py-3">{t.origin} → {t.destination}</td>
              <td className="px-4 py-3">{t.vehicle_id || "-"}</td>
              <td className="px-4 py-3">{t.driver_id || "-"}</td>
              <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => edit(t)}>Edit</Button>
                  <Button variant="danger" onClick={() => remove(t.id)}>Delete</Button>
                </div>
              </td>
            </tr>
          ))}
          mobileCards={rows.map((t) => (
            <div key={`m-${t.id}`} className="rounded-2xl border border-white/60 bg-white/80 p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">{t.trip_code}</p>
                <StatusBadge status={t.status} />
              </div>
              <p className="mt-1 text-sm text-slate-600">{t.origin} → {t.destination}</p>
              <p className="mt-1 text-sm text-slate-500">Vehicle: {t.vehicle_id || "-"} • Driver: {t.driver_id || "-"}</p>
              <div className="mt-3 flex gap-2">
                <Button variant="ghost" onClick={() => edit(t)}>Edit</Button>
                <Button variant="danger" onClick={() => remove(t.id)}>Delete</Button>
              </div>
            </div>
          ))}
          emptyTitle="No trips"
          emptyMessage="Create a trip to start planning and dispatch."
        />
        {!rows.length ? <div className="mt-3"><EmptyState title="Trip list is empty" message="Trips from DB will appear here." /></div> : null}
        <PaginationBar summary={`Total trips: ${rows.length}`} />
      </Card>
    </div>
  );
}
