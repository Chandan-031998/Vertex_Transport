import React, { useEffect, useState } from "react";
import { http } from "../api/http";
import { Button, Card, FilterRow, Input, PaginationBar, Select, TableShell } from "../components/admin/Primitives";

export default function SystemLogs() {
  const [rows, setRows] = useState<any[]>([]);

  const load = async () => {
    try {
      const res = await http.get("/users/audit-logs");
      setRows(res.data?.data || []);
    } catch {
      setRows([]);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <Card title="System Logs" actions={<Button onClick={load}>Refresh</Button>}>
      <FilterRow>
        <Input placeholder="Search actor/action/module..." />
        <Select defaultValue="all"><option value="all">Module</option><option>users</option><option>settings</option><option>auth</option></Select>
        <Input type="date" />
        <Input type="date" />
        <Button>Apply</Button>
        <Button>Export</Button>
      </FilterRow>

      <TableShell
        headers={["Time", "Action", "Module", "Actor", "IP", "Entity"]}
        rows={(rows.length ? rows : [{ created_at: "-", action: "No logs", module: "-", actor_email: "-", ip: "-", entity: "-" }]).map((r: any, idx: number) => (
          <tr key={r.id || idx} className="border-t border-slate-100 hover:bg-slate-50/70">
            <td className="px-4 py-3">{r.created_at}</td>
            <td className="px-4 py-3">{r.action}</td>
            <td className="px-4 py-3">{r.module}</td>
            <td className="px-4 py-3">{r.actor_email || "-"}</td>
            <td className="px-4 py-3">{r.ip || "-"}</td>
            <td className="px-4 py-3">{r.entity || "-"}</td>
          </tr>
        ))}
      />
      <PaginationBar />
    </Card>
  );
}
