import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, EmptyState, FilterRow, Input, KpiCard, PaginationBar, Select, StatusBadge, TableShell } from "../components/admin/Primitives";
import { http } from "../api/http";

function money(value: any) {
  const n = Number(value || 0);
  return `INR ${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export default function Billing() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [outstanding, setOutstanding] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [customerForm, setCustomerForm] = useState<any>({ name: "", gst_no: "", phone: "", email: "" });
  const [invoiceForm, setInvoiceForm] = useState<any>({ customer_id: "", invoice_no: "", invoice_date: "", subtotal: "", tax_total: "", total: "" });

  const load = async () => {
    try {
      const [cRes, iRes, oRes] = await Promise.all([
        http.get("/billing/customers"),
        http.get("/billing/invoices"),
        http.get("/billing/invoices/outstanding"),
      ]);
      setCustomers(cRes.data?.data || []);
      setInvoices(iRes.data?.data || []);
      setOutstanding(oRes.data?.data || []);
      setErr(null);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to load billing");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const metrics = useMemo(() => {
    const billed = invoices.reduce((s, x) => s + Number(x.total || 0), 0);
    const paid = invoices.reduce((s, x) => s + Number(x.amount_paid || 0), 0);
    const due = outstanding.reduce((s, x) => s + Number(x.outstanding_amount || 0), 0);
    return { billed, paid, due };
  }, [invoices, outstanding]);

  const createCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await http.post("/billing/customers", customerForm);
      setCustomerForm({ name: "", gst_no: "", phone: "", email: "" });
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Create customer failed");
    }
  };

  const createInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await http.post("/billing/invoices", {
        customer_id: Number(invoiceForm.customer_id),
        invoice_no: invoiceForm.invoice_no,
        invoice_date: invoiceForm.invoice_date,
        subtotal: Number(invoiceForm.subtotal),
        tax_total: Number(invoiceForm.tax_total),
        total: Number(invoiceForm.total),
      });
      setInvoiceForm({ customer_id: "", invoice_no: "", invoice_date: "", subtotal: "", tax_total: "", total: "" });
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Create invoice failed");
    }
  };

  const exportCsv = async () => {
    try {
      const res = await http.get("/billing/invoices/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "invoices.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Export failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <KpiCard label="Billed Amount" value={money(metrics.billed)} trend="Total invoiced from DB records" />
        <KpiCard label="Collected Amount" value={money(metrics.paid)} trend="Payments received" />
        <KpiCard label="Outstanding" value={money(metrics.due)} trend="Pending recovery" tone="warning" />
      </div>

      <Card title="Billing Operations" subtitle="Manage customers and invoices." actions={<div className="flex gap-2"><Button onClick={load}>Refresh</Button><Button onClick={exportCsv}>Export CSV</Button></div>}>
        {err ? <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">{err}</div> : null}

        <div className="grid gap-4 lg:grid-cols-2">
          <form onSubmit={createCustomer} className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 space-y-2">
            <div className="font-semibold text-slate-900">Create Customer</div>
            <Input placeholder="Name" value={customerForm.name} onChange={(e) => setCustomerForm((p: any) => ({ ...p, name: e.target.value }))} required />
            <Input placeholder="GST Number" value={customerForm.gst_no} onChange={(e) => setCustomerForm((p: any) => ({ ...p, gst_no: e.target.value }))} />
            <Input placeholder="Phone" value={customerForm.phone} onChange={(e) => setCustomerForm((p: any) => ({ ...p, phone: e.target.value }))} />
            <Input placeholder="Email" value={customerForm.email} onChange={(e) => setCustomerForm((p: any) => ({ ...p, email: e.target.value }))} />
            <Button type="submit" variant="primary">Create Customer</Button>
          </form>

          <form onSubmit={createInvoice} className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 space-y-2">
            <div className="font-semibold text-slate-900">Create Invoice</div>
            <Select value={invoiceForm.customer_id} onChange={(e) => setInvoiceForm((p: any) => ({ ...p, customer_id: e.target.value }))} required>
              <option value="">Select customer</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Input placeholder="Invoice Number" value={invoiceForm.invoice_no} onChange={(e) => setInvoiceForm((p: any) => ({ ...p, invoice_no: e.target.value }))} required />
            <Input type="date" value={invoiceForm.invoice_date} onChange={(e) => setInvoiceForm((p: any) => ({ ...p, invoice_date: e.target.value }))} required />
            <div className="grid grid-cols-3 gap-2">
              <Input placeholder="Subtotal" value={invoiceForm.subtotal} onChange={(e) => setInvoiceForm((p: any) => ({ ...p, subtotal: e.target.value }))} required />
              <Input placeholder="Tax" value={invoiceForm.tax_total} onChange={(e) => setInvoiceForm((p: any) => ({ ...p, tax_total: e.target.value }))} required />
              <Input placeholder="Total" value={invoiceForm.total} onChange={(e) => setInvoiceForm((p: any) => ({ ...p, total: e.target.value }))} required />
            </div>
            <Button type="submit" variant="primary">Create Invoice</Button>
          </form>
        </div>
      </Card>

      <Card title="Invoices">
        <FilterRow>
          <Input placeholder="Search invoice / customer..." />
          <Select defaultValue="all"><option value="all">Status</option></Select>
          <Input type="date" />
          <Input type="date" />
          <Button>Apply</Button>
          <Button>Clear</Button>
        </FilterRow>

        <TableShell
          headers={["Invoice", "Customer", "Total", "Paid", "Outstanding", "Status"]}
          rows={invoices.map((inv) => (
            <tr key={inv.id} className="border-t border-slate-100 hover:bg-slate-50/70">
              <td className="px-4 py-3 font-medium">{inv.invoice_no}</td>
              <td className="px-4 py-3">{inv.customer_name}</td>
              <td className="px-4 py-3">{money(inv.total)}</td>
              <td className="px-4 py-3">{money(inv.amount_paid)}</td>
              <td className="px-4 py-3">{money(Number(inv.total || 0) - Number(inv.amount_paid || 0))}</td>
              <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
            </tr>
          ))}
          mobileCards={invoices.map((inv) => (
            <div key={`m-${inv.id}`} className="rounded-2xl border border-white/60 bg-white/80 p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">{inv.invoice_no}</p>
                <StatusBadge status={inv.status} />
              </div>
              <p className="mt-1 text-sm text-slate-600">{inv.customer_name}</p>
              <p className="mt-1 text-sm text-slate-500">Total: {money(inv.total)} • Paid: {money(inv.amount_paid)}</p>
            </div>
          ))}
          emptyTitle="No invoices"
          emptyMessage="Invoice records from DB will show here."
        />
        {!invoices.length ? <div className="mt-3"><EmptyState title="Invoice list is empty" message="Create an invoice to start billing." /></div> : null}
        <PaginationBar summary={`Total invoices: ${invoices.length}`} />
      </Card>

      <Card title="Outstanding Payments">
        {outstanding.length ? (
          <div className="space-y-2">
            {outstanding.map((o) => (
              <div key={o.id} className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3 text-sm text-amber-900">
                {o.invoice_no} • {o.customer_name} • {money(o.outstanding_amount)}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No outstanding payments" message="All invoices are settled." />
        )}
      </Card>
    </div>
  );
}
