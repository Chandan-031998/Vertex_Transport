import React from "react";
import { http } from "../api/http";
import { Button, Card } from "../components/admin/Primitives";

export default function BillingExport() {
  const exportInvoices = async () => {
    const res = await http.get("/billing/invoices/export", { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = "invoices.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <Card title="Export Billing Data">
      <div className="flex gap-2">
        <Button onClick={exportInvoices} variant="primary">Export Invoices CSV</Button>
      </div>
    </Card>
  );
}
