import React, { useEffect, useMemo, useState } from "react";
import { http } from "../api/http";
import { Button, Card, Select, StatusBadge, TableShell } from "../components/admin/Primitives";

const driverStatuses = ["ASSIGNED", "STARTED", "IN_TRANSIT", "DELIVERED", "POD_SUBMITTED"] as const;

export default function DriverTrips({ mode = "active" }: { mode?: "active" | "past" }) {
  const [rows, setRows] = useState<any[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);
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

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const pastSet = new Set(["DELIVERED", "POD_SUBMITTED", "CLOSED", "SETTLED"]);
    return rows.filter((t) => (mode === "past" ? pastSet.has(t.status) : !pastSet.has(t.status)));
  }, [rows, mode]);

  const updateStatus = async (tripId: number, status: string) => {
    try {
      setBusyId(tripId);
      await http.put(`/trips/${tripId}`, { status });
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Status update failed");
    } finally {
      setBusyId(null);
    }
  };

  const title = mode === "past" ? "Past Trips" : "Assigned Trips";

  return (
    <div className="space-y-4">
      {err && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      <Card title={title} actions={<Button onClick={load}>Refresh</Button>}>
        <TableShell
          headers={["Trip", "Route", "Vehicle", "Status", mode === "past" ? "Completed" : "Update Status"]}
          rows={filtered.map((t) => (
            <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50/70">
              <td className="px-4 py-3 font-medium">{t.trip_code}</td>
              <td className="px-4 py-3">{t.origin} → {t.destination}</td>
              <td className="px-4 py-3">{t.vehicle_no || "-"}</td>
              <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
              <td className="px-4 py-3">
                {mode === "past" ? (
                  <span className="text-sm text-slate-500">{t.end_date || "-"}</span>
                ) : (
                  <Select
                    value={t.status}
                    disabled={busyId === t.id}
                    onChange={(e) => updateStatus(t.id, e.target.value)}
                  >
                    {driverStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </Select>
                )}
              </td>
            </tr>
          ))}
        />
        {!filtered.length && <div className="mt-3 text-sm text-slate-500">No trips available.</div>}
      </Card>
    </div>
  );
}

