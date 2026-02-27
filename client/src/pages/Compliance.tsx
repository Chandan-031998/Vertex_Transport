import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, FilterRow, Input, Select, StatusBadge, TableShell } from "../components/admin/Primitives";
import { http } from "../api/http";

export default function Compliance() {
  const [fleetAlerts, setFleetAlerts] = useState<any>({ documents: [], amc: [], maintenance: [] });
  const [licenseAlerts, setLicenseAlerts] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    try {
      const [fRes, lRes] = await Promise.all([
        http.get("/fleet/alerts/expiry?days=30"),
        http.get("/drivers/alerts/license-expiry?days=30"),
      ]);
      setFleetAlerts(fRes.data?.data || { documents: [], amc: [], maintenance: [] });
      setLicenseAlerts(lRes.data?.data || []);
      setErr(null);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to load compliance data");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const flatRows = useMemo(() => {
    const docs = (fleetAlerts.documents || []).map((x: any) => ({
      vehicle: x.vehicle_no,
      item: x.doc_type,
      due: x.expiry_date,
      status: Number(x.days_left) < 0 ? "EXPIRED" : "EXPIRING",
      source: "Vehicle Documents",
    }));
    const amc = (fleetAlerts.amc || []).map((x: any) => ({
      vehicle: x.vehicle_no,
      item: `AMC - ${x.provider_name}`,
      due: x.end_date,
      status: Number(x.days_left) < 0 ? "EXPIRED" : "EXPIRING",
      source: "AMC",
    }));
    const license = (licenseAlerts || []).map((x: any) => ({
      vehicle: x.name,
      item: `License ${x.license_no || ""}`,
      due: x.license_expiry,
      status: Number(x.days_left) < 0 ? "EXPIRED" : "EXPIRING",
      source: "Driver License",
    }));
    return [...docs, ...amc, ...license];
  }, [fleetAlerts, licenseAlerts]);

  return (
    <div className="space-y-4">
      {err && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>}

      <Card title="Compliance Tracker" actions={<Button onClick={load}>Refresh</Button>}>
        <FilterRow>
          <Input placeholder="Search vehicle / document..." />
          <Select defaultValue="all"><option value="all">Document Type</option></Select>
          <Select defaultValue="all"><option value="all">Status</option></Select>
          <Input type="date" /><Input type="date" />
          <Button>Apply</Button>
        </FilterRow>

        <TableShell
          headers={["Reference", "Item", "Due Date", "Source", "Status"]}
          rows={flatRows.map((r, i) => (
            <tr key={`${r.item}-${i}`} className="border-t border-slate-100">
              <td className="px-4 py-3 font-medium">{r.vehicle}</td>
              <td className="px-4 py-3">{r.item}</td>
              <td className="px-4 py-3">{r.due}</td>
              <td className="px-4 py-3">{r.source}</td>
              <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
            </tr>
          ))}
        />
        {!flatRows.length && <div className="mt-3 text-sm text-slate-500">No compliance alerts available in DB.</div>}
      </Card>
    </div>
  );
}
