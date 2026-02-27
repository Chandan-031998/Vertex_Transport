import React, { useEffect, useMemo, useState } from "react";
import { http } from "../api/http";
import PermissionGate from "../auth/PermissionGate";
import { Permissions } from "../constants/permissions";
import { Button, Card, EmptyState, Input, Select } from "../components/ui";
import { StatusBadge, TableShell } from "../components/admin/Primitives";

type Role = {
  id: number;
  name: string;
  code: string;
  description: string | null;
  is_system: boolean;
  status: "ACTIVE" | "INACTIVE";
  permission_codes: string[];
};

type Permission = { id: number; code: string; name: string; module: string };

type FormState = {
  name: string;
  description: string;
  status: "ACTIVE" | "INACTIVE";
  permission_codes: string[];
};

const emptyForm: FormState = {
  name: "",
  description: "",
  status: "ACTIVE",
  permission_codes: [],
};

export default function Roles() {
  const [rows, setRows] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const groupedPermissions = useMemo(() => {
    return permissions.reduce<Record<string, Permission[]>>((acc, item) => {
      if (!acc[item.module]) acc[item.module] = [];
      acc[item.module].push(item);
      return acc;
    }, {});
  }, [permissions]);

  const load = async () => {
    try {
      const [rolesRes, permsRes] = await Promise.all([
        http.get("/roles"),
        http.get("/roles/permissions"),
      ]);
      setRows(rolesRes.data?.data || []);
      setPermissions(permsRes.data?.data || []);
      setErr(null);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to load roles");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      if (editingId) {
        await http.put(`/roles/${editingId}`, form);
      } else {
        await http.post("/roles", form);
      }
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to save role");
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (role: Role) => {
    setEditingId(role.id);
    setForm({
      name: role.name,
      description: role.description || "",
      status: role.status,
      permission_codes: role.permission_codes || [],
    });
  };

  const remove = async (role: Role) => {
    if (!window.confirm(`Delete role '${role.name}'?`)) return;
    try {
      await http.delete(`/roles/${role.id}`);
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to delete role");
    }
  };

  const togglePermission = (permissionCode: string) => {
    setForm((prev) => {
      const exists = prev.permission_codes.includes(permissionCode);
      if (exists) {
        return { ...prev, permission_codes: prev.permission_codes.filter((code) => code !== permissionCode) };
      }
      return { ...prev, permission_codes: [...prev.permission_codes, permissionCode] };
    });
  };

  return (
    <div className="space-y-4">
      <Card title="Roles & Permission Matrix" subtitle="Configure role access per module." actions={<Button onClick={load}>Refresh</Button>}>
        {err ? <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">{err}</div> : null}
        <TableShell
          headers={["Role", "Code", "Purpose", "Type", "Status", "Permissions", "Actions"]}
          rows={rows.map((role) => (
            <tr key={role.id} className="border-t border-slate-100 hover:bg-slate-50/70">
              <td className="p-3 font-medium">{role.name}</td>
              <td className="p-3">{role.code}</td>
              <td className="p-3">{role.description || "-"}</td>
              <td className="p-3">{role.is_system ? "System" : "Custom"}</td>
              <td className="p-3"><StatusBadge status={role.status} /></td>
              <td className="p-3">{(role.permission_codes || []).length}</td>
              <td className="p-3">
                <PermissionGate anyOf={[Permissions.ROLES_MANAGE]}>
                  <div className="flex gap-2">
                    <Button disabled={role.is_system} variant="ghost" onClick={() => startEdit(role)}>Edit</Button>
                    <Button disabled={role.is_system} variant="danger" onClick={() => remove(role)}>Delete</Button>
                  </div>
                </PermissionGate>
              </td>
            </tr>
          ))}
          mobileCards={rows.map((role) => (
            <div key={`m-${role.id}`} className="rounded-2xl border border-white/60 bg-white/80 p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">{role.name}</p>
                <StatusBadge status={role.status} />
              </div>
              <p className="mt-1 text-sm text-slate-600">{role.code} • {role.is_system ? "System" : "Custom"}</p>
              <p className="mt-1 text-sm text-slate-500">Permissions: {(role.permission_codes || []).length}</p>
            </div>
          ))}
          emptyTitle="No roles found"
          emptyMessage="Roles will be listed here."
        />
        {!rows.length ? <div className="mt-3"><EmptyState title="Role list is empty" message="Create your first custom role." /></div> : null}
      </Card>

      <PermissionGate anyOf={[Permissions.ROLES_MANAGE]}>
        <Card title={editingId ? "Edit Role" : "Create Role"}>
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Role name" required />
              <Select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as FormState["status"] }))}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </Select>
            </div>
            <Input value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Description / purpose" />

            <div className="space-y-3">
              {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                <section key={module} className="rounded-2xl border border-slate-200/70 bg-white/70 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{module}</p>
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    {modulePermissions.map((permission) => (
                      <label key={permission.id} className="flex items-start gap-2 rounded-xl border border-slate-200/70 bg-white p-2 text-sm text-slate-700">
                        <input type="checkbox" checked={form.permission_codes.includes(permission.code)} onChange={() => togglePermission(permission.code)} className="mt-0.5" />
                        <span>{permission.name}</span>
                      </label>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="flex gap-2">
              <Button disabled={busy} variant="primary">{busy ? "Saving..." : editingId ? "Update role" : "Create role"}</Button>
              {editingId ? <Button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</Button> : null}
            </div>
          </form>
        </Card>
      </PermissionGate>
    </div>
  );
}
