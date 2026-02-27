import React, { useEffect, useState } from "react";
import { http } from "../api/http";
import { Button, Card, Input, Select, StatusBadge, TableShell } from "../components/admin/Primitives";

export default function DriversKycAttendance() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [driverId, setDriverId] = useState<string>("");
  const [kycDocs, setKycDocs] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [attendanceForm, setAttendanceForm] = useState<any>({ attendance_date: "", source: "APP", status: "PRESENT" });

  const loadDrivers = async () => {
    const res = await http.get("/drivers");
    const rows = res.data?.data || [];
    setDrivers(rows);
    if (!driverId && rows[0]) setDriverId(String(rows[0].id));
  };

  const loadModules = async (id: string) => {
    if (!id) return;
    const [k, a] = await Promise.all([
      http.get(`/drivers/${id}/kyc-documents`),
      http.get(`/drivers/${id}/attendance`),
    ]);
    setKycDocs(k.data?.data || []);
    setAttendance(a.data?.data || []);
  };

  const load = async () => {
    try {
      await loadDrivers();
      setErr(null);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to load drivers");
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { if (driverId) loadModules(driverId).catch((e: any) => setErr(e?.response?.data?.message || "Load failed")); }, [driverId]);

  const saveAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await http.post("/drivers/attendance", { driver_id: Number(driverId), ...attendanceForm });
      setAttendanceForm({ attendance_date: "", source: "APP", status: "PRESENT" });
      await loadModules(driverId);
    } catch (e: any) { setErr(e?.response?.data?.message || "Save failed"); }
  };

  const reviewKyc = async (docId: number, status: "VERIFIED" | "REJECTED") => {
    try {
      await http.put(`/drivers/${driverId}/kyc-documents/${docId}/status`, { status, reject_reason: status === "REJECTED" ? "Rejected by admin" : null });
      await loadModules(driverId);
    } catch (e: any) { setErr(e?.response?.data?.message || "Review failed"); }
  };

  return (
    <div className="space-y-4">
      {err && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      <Card title="KYC & Attendance" actions={<Button onClick={load}>Refresh</Button>}>
        <div className="mb-4 max-w-sm"><Select value={driverId} onChange={(e) => setDriverId(e.target.value)}><option value="">Select driver</option>{drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</Select></div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <h4 className="mb-2 font-semibold">KYC Verification</h4>
            <TableShell headers={["Doc", "Status", "Action"]} rows={kycDocs.map((d) => (
              <tr key={d.id} className="border-t"><td className="px-4 py-3">{d.doc_type}</td><td className="px-4 py-3"><StatusBadge status={d.status} /></td><td className="px-4 py-3"><div className="flex gap-2"><button className="enterprise-btn" onClick={() => reviewKyc(d.id, "VERIFIED")}>Verify</button><button className="enterprise-btn" onClick={() => reviewKyc(d.id, "REJECTED")}>Reject</button></div></td></tr>
            ))} />
            {!kycDocs.length && <div className="mt-2 text-sm text-slate-500">No KYC docs for selected driver.</div>}
          </div>

          <div>
            <h4 className="mb-2 font-semibold">Attendance (GPS/App)</h4>
            <form onSubmit={saveAttendance} className="mb-3 grid gap-2 md:grid-cols-4">
              <Input type="date" value={attendanceForm.attendance_date} onChange={(e) => setAttendanceForm((p: any) => ({ ...p, attendance_date: e.target.value }))} required />
              <Select value={attendanceForm.source} onChange={(e) => setAttendanceForm((p: any) => ({ ...p, source: e.target.value }))}><option>APP</option><option>GPS</option></Select>
              <Select value={attendanceForm.status} onChange={(e) => setAttendanceForm((p: any) => ({ ...p, status: e.target.value }))}><option>PRESENT</option><option>ABSENT</option><option>LEAVE</option></Select>
              <Button type="submit" variant="primary">Save</Button>
            </form>
            <TableShell headers={["Date", "Source", "Status"]} rows={attendance.map((a) => (
              <tr key={a.id} className="border-t"><td className="px-4 py-3">{a.attendance_date}</td><td className="px-4 py-3">{a.source}</td><td className="px-4 py-3"><StatusBadge status={a.status} /></td></tr>
            ))} />
          </div>
        </div>
      </Card>
    </div>
  );
}
