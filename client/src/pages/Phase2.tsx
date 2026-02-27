import React from "react";
import { Card, Badge } from "../components/ui";

export default function Phase2() {
  return (
    <Card title="Phase-2 (Premium)" subtitle="Tracking, Geofence, Vendors/Brokers, Compliance alerts, Integrations.">
      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-2xl border border-white/50 bg-white/70 p-4 shadow-sm">/api/tracking <div className="mt-2"><Badge status="PENDING" /></div></div>
        <div className="rounded-2xl border border-white/50 bg-white/70 p-4 shadow-sm">/api/vendors <div className="mt-2"><Badge status="ACTIVE" /></div></div>
        <div className="rounded-2xl border border-white/50 bg-white/70 p-4 shadow-sm">/api/brokers <div className="mt-2"><Badge status="ACTIVE" /></div></div>
        <div className="rounded-2xl border border-white/50 bg-white/70 p-4 shadow-sm">/api/compliance <div className="mt-2"><Badge status="PENDING" /></div></div>
        <div className="rounded-2xl border border-white/50 bg-white/70 p-4 shadow-sm sm:col-span-2">/api/integrations <div className="mt-2"><Badge status="PENDING" /></div></div>
      </div>
    </Card>
  );
}
