import React, { useEffect, useState } from "react";
import { http } from "../api/http";
import PermissionGate from "../auth/PermissionGate";
import { Permissions } from "../constants/permissions";
import { Button, Card, EmptyState, Input, Select } from "../components/ui";
import { StatusBadge, TableShell } from "../components/admin/Primitives";

type Role = { id: number; name: string; code: string; is_system: boolean; status: string };

type User = {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role: string;
  role_name: string;
  driver_id?: number | null;
  driver_name?: string | null;
  status: "ACTIVE" | "INACTIVE";
};

type FormState = {
  name: string;
  email: string;
  password: string;
  role_id: string;
  driver_id: string;
  status: "ACTIVE" | "INACTIVE";
};

const emptyForm: FormState = {
  name: "",
  email: "",
  password: "",
  role_id: "",
  driver_id: "",
  status: "ACTIVE",
};

export default function Users() {
  const [rows, setRows] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [drivers, setDrivers] = useState<Array<{ id: number; name: string }>>([]);
  const [loginActivity, setLoginActivity] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        http.get("/users"),
        http.get("/roles"),
      ]);
      setRows(usersRes.data?.data || []);
      setRoles((rolesRes.data?.data || []).filter((role: Role) => role.status === "ACTIVE"));
      try {
        const driversRes = await http.get("/drivers");
        setDrivers((driversRes.data?.data || []).map((d: any) => ({ id: d.id, name: d.name })));
      } catch {
        setDrivers([]);
      }
      try {
        const [loginRes, auditRes] = await Promise.all([
          http.get("/users/login-activity"),
          http.get("/users/audit-logs"),
        ]);
        setLoginActivity(loginRes.data?.data || []);
        setAuditLogs(auditRes.data?.data || []);
      } catch {
        setLoginActivity([]);
        setAuditLogs([]);
      }
      setErr(null);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to load users");
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
        await http.put(`/users/${editingId}`, {
          name: form.name,
          email: form.email,
          role_id: Number(form.role_id),
          driver_id: form.driver_id ? Number(form.driver_id) : null,
          status: form.status,
        });
      } else {
        await http.post("/users", {
          name: form.name,
          email: form.email,
          password: form.password,
          role_id: Number(form.role_id),
          driver_id: form.driver_id ? Number(form.driver_id) : null,
          status: form.status,
        });
      }
      setEditingId(null);
      setForm(emptyForm);
      await load();
    } catch (e: any) {
      const details = e?.response?.data?.details;
      const detailMsg = Array.isArray(details) ? details[0]?.message : null;
      setErr(detailMsg || e?.response?.data?.message || "Failed to save user");
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role_id: String(user.role_id),
      driver_id: user.driver_id ? String(user.driver_id) : "",
      status: user.status,
    });
  };

  const remove = async (user: User) => {
    if (!window.confirm(`Delete user '${user.email}'?`)) return;
    try {
      await http.delete(`/users/${user.id}`);
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to delete user");
    }
  };

  const resetPassword = async (user: User) => {
    const password = window.prompt(`Enter new password for ${user.email}`);
    if (!password) return;
    try {
      await http.post(`/users/${user.id}/reset-password`, { password });
      window.alert("Password reset successfully");
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="space-y-4">
      <Card title="Users" actions={<Button onClick={load}>Refresh</Button>}>
        {err ? <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">{err}</div> : null}

        <TableShell
          headers={["Name", "Email", "Role", "Driver Profile", "Status", "Actions"]}
          rows={rows.map((user) => (
            <tr key={user.id} className="border-t border-slate-100 hover:bg-slate-50/70">
              <td className="p-3 font-medium">{user.name}</td>
              <td className="p-3">{user.email}</td>
              <td className="p-3">{user.role_name || user.role}</td>
              <td className="p-3">{user.driver_name || "-"}</td>
              <td className="p-3"><StatusBadge status={user.status} /></td>
              <td className="p-3">
                <div className="flex flex-wrap gap-2">
                  <PermissionGate anyOf={[Permissions.USERS_MANAGE]}>
                    <Button variant="ghost" onClick={() => startEdit(user)}>Edit</Button>
                  </PermissionGate>
                  <PermissionGate anyOf={[Permissions.USERS_RESET_PASSWORD, Permissions.USERS_MANAGE]}>
                    <Button variant="secondary" onClick={() => resetPassword(user)}>Reset password</Button>
                  </PermissionGate>
                  <PermissionGate anyOf={[Permissions.USERS_MANAGE]}>
                    <Button variant="danger" onClick={() => remove(user)}>Delete</Button>
                  </PermissionGate>
                </div>
              </td>
            </tr>
          ))}
          mobileCards={rows.map((user) => (
            <div key={`m-${user.id}`} className="rounded-2xl border border-white/60 bg-white/80 p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">{user.name}</p>
                <StatusBadge status={user.status} />
              </div>
              <p className="text-sm text-slate-600">{user.email}</p>
              <p className="mt-1 text-sm text-slate-500">{user.role_name || user.role} • {user.driver_name || "No driver profile"}</p>
            </div>
          ))}
          emptyTitle="No users found"
          emptyMessage="Create a user account to start role assignment."
        />
        {!rows.length ? <div className="mt-3"><EmptyState title="User list is empty" message="User records from DB will show here." /></div> : null}
      </Card>

      <PermissionGate anyOf={[Permissions.USERS_MANAGE]}>
        <Card title={editingId ? "Edit User" : "Create User"}>
          <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
            <Input placeholder="Name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
            <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} required />
            {!editingId ? (
              <div>
                <Input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} required />
                <p className="mt-1 text-xs text-slate-500">Min 8 chars with uppercase, lowercase, and number</p>
              </div>
            ) : <div />}
            <Select value={form.role_id} onChange={(e) => setForm((prev) => ({ ...prev, role_id: e.target.value }))} required>
              <option value="">Select role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </Select>
            <Select value={form.driver_id} onChange={(e) => setForm((prev) => ({ ...prev, driver_id: e.target.value }))} disabled={roles.find((r) => String(r.id) === form.role_id)?.code !== "DRIVER"}>
              <option value="">Select driver profile</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>{driver.name}</option>
              ))}
            </Select>
            <Select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as FormState["status"] }))}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </Select>
            <div className="md:col-span-2 flex gap-2">
              <Button disabled={busy} variant="primary">{busy ? "Saving..." : editingId ? "Update user" : "Create user"}</Button>
              {editingId ? <Button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</Button> : null}
            </div>
          </form>
        </Card>
      </PermissionGate>

      <Card title="Login Activity">
        {loginActivity.length ? (
          <div className="space-y-1 text-sm">
            {loginActivity.slice(0, 20).map((a) => (
              <div key={a.id} className="rounded-xl border border-slate-200/70 bg-white/70 p-2">
                {a.created_at} • {a.actor_email || "Unknown"} • {a.ip || "NA"}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No login activity" message="User login events will appear here." />
        )}
      </Card>

      <Card title="Audit Log">
        {auditLogs.length ? (
          <div className="space-y-1 text-sm">
            {auditLogs.slice(0, 30).map((a) => (
              <div key={a.id} className="rounded-xl border border-slate-200/70 bg-white/70 p-2">
                {a.created_at} • {a.action} ({a.module}) by {a.actor_email || "Unknown"}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No audit logs" message="Audit events will appear after module activity." />
        )}
      </Card>
    </div>
  );
}
