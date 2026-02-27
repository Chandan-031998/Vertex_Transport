import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button, Card, Input, Select, StatusBadge, TableShell } from "../components/admin/Primitives";
import { http } from "../api/http";

export default function VendorBroker() {
  const location = useLocation();
  const mode = useMemo(() => {
    if (location.pathname.includes("/subcontract-trips")) return "subcontract";
    if (location.pathname.includes("/commission-settlement")) return "commission";
    return "vendors";
  }, [location.pathname]);

  const [vendors, setVendors] = useState<any[]>([]);
  const [vendorVehicles, setVendorVehicles] = useState<any[]>([]);
  const [subTrips, setSubTrips] = useState<any[]>([]);
  const [vendorSettlements, setVendorSettlements] = useState<any[]>([]);
  const [brokers, setBrokers] = useState<any[]>([]);
  const [brokerCommissions, setBrokerCommissions] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);

  const [vendorForm, setVendorForm] = useState<any>({ name: "", contact_person: "", phone: "", email: "", gst_no: "", address: "", status: "ACTIVE" });
  const [vendorVehicleForm, setVendorVehicleForm] = useState<any>({ vendor_id: "", vehicle_no: "", vehicle_type: "", capacity_tons: "", status: "ACTIVE" });
  const [subTripForm, setSubTripForm] = useState<any>({ trip_id: "", vendor_id: "", vendor_vehicle_id: "", freight_amount: "", assigned_on: "", status: "ASSIGNED", note: "" });
  const [brokerForm, setBrokerForm] = useState<any>({ name: "", phone: "", email: "", commission_type: "PERCENTAGE", status: "ACTIVE" });
  const [brokerCommissionForm, setBrokerCommissionForm] = useState<any>({ broker_id: "", trip_id: "", commission_type: "PERCENTAGE", commission_value: "", commission_amount: "", status: "PENDING", note: "" });
  const [vendorSettlementForm, setVendorSettlementForm] = useState<any>({ vendor_id: "", settlement_date: "", gross_amount: "", deductions: "", status: "PENDING", note: "" });

  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    try {
      const [vendorRes, vehicleRes, subcontractRes, settlementRes, brokerRes, commissionRes, tripRes] = await Promise.all([
        http.get("/vendors"),
        http.get("/vendors/vehicles"),
        http.get("/vendors/subcontract-trips"),
        http.get("/vendors/settlements"),
        http.get("/brokers"),
        http.get("/brokers/commissions"),
        http.get("/trips"),
      ]);
      setVendors(vendorRes.data?.data || []);
      setVendorVehicles(vehicleRes.data?.data || []);
      setSubTrips(subcontractRes.data?.data || []);
      setVendorSettlements(settlementRes.data?.data || []);
      setBrokers(brokerRes.data?.data || []);
      setBrokerCommissions(commissionRes.data?.data || []);
      setTrips(tripRes.data?.data || []);
      setErr(null);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to load Vendor & Broker module");
    }
  };

  useEffect(() => { load(); }, []);

  const createVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await http.post("/vendors", vendorForm);
      setVendorForm({ name: "", contact_person: "", phone: "", email: "", gst_no: "", address: "", status: "ACTIVE" });
      await load();
    } catch (e: any) { setErr(e?.response?.data?.message || "Create vendor failed"); }
  };

  const createVendorVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await http.post("/vendors/vehicles", {
        ...vendorVehicleForm,
        vendor_id: Number(vendorVehicleForm.vendor_id),
        capacity_tons: vendorVehicleForm.capacity_tons ? Number(vendorVehicleForm.capacity_tons) : null,
      });
      setVendorVehicleForm({ vendor_id: "", vehicle_no: "", vehicle_type: "", capacity_tons: "", status: "ACTIVE" });
      await load();
    } catch (e: any) { setErr(e?.response?.data?.message || "Create vendor vehicle failed"); }
  };

  const createSubcontractTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await http.post("/vendors/subcontract-trips", {
        ...subTripForm,
        trip_id: subTripForm.trip_id ? Number(subTripForm.trip_id) : null,
        vendor_id: Number(subTripForm.vendor_id),
        vendor_vehicle_id: subTripForm.vendor_vehicle_id ? Number(subTripForm.vendor_vehicle_id) : null,
        freight_amount: Number(subTripForm.freight_amount || 0),
      });
      setSubTripForm({ trip_id: "", vendor_id: "", vendor_vehicle_id: "", freight_amount: "", assigned_on: "", status: "ASSIGNED", note: "" });
      await load();
    } catch (e: any) { setErr(e?.response?.data?.message || "Create subcontract trip failed"); }
  };

  const createBroker = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await http.post("/brokers", brokerForm);
      setBrokerForm({ name: "", phone: "", email: "", commission_type: "PERCENTAGE", status: "ACTIVE" });
      await load();
    } catch (e: any) { setErr(e?.response?.data?.message || "Create broker failed"); }
  };

  const createBrokerCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await http.post("/brokers/commissions", {
        ...brokerCommissionForm,
        broker_id: Number(brokerCommissionForm.broker_id),
        trip_id: brokerCommissionForm.trip_id ? Number(brokerCommissionForm.trip_id) : null,
        commission_value: Number(brokerCommissionForm.commission_value || 0),
        commission_amount: Number(brokerCommissionForm.commission_amount || 0),
      });
      setBrokerCommissionForm({ broker_id: "", trip_id: "", commission_type: "PERCENTAGE", commission_value: "", commission_amount: "", status: "PENDING", note: "" });
      await load();
    } catch (e: any) { setErr(e?.response?.data?.message || "Create broker commission failed"); }
  };

  const createVendorSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await http.post("/vendors/settlements", {
        ...vendorSettlementForm,
        vendor_id: Number(vendorSettlementForm.vendor_id),
        gross_amount: Number(vendorSettlementForm.gross_amount || 0),
        deductions: Number(vendorSettlementForm.deductions || 0),
      });
      setVendorSettlementForm({ vendor_id: "", settlement_date: "", gross_amount: "", deductions: "", status: "PENDING", note: "" });
      await load();
    } catch (e: any) { setErr(e?.response?.data?.message || "Create vendor settlement failed"); }
  };

  const deleteVendor = async (id: number) => {
    if (!window.confirm("Delete vendor?")) return;
    try {
      await http.delete(`/vendors/${id}`);
      await load();
    } catch (e: any) { setErr(e?.response?.data?.message || "Delete vendor failed"); }
  };

  const deleteBroker = async (id: number) => {
    if (!window.confirm("Delete broker?")) return;
    try {
      await http.delete(`/brokers/${id}`);
      await load();
    } catch (e: any) { setErr(e?.response?.data?.message || "Delete broker failed"); }
  };

  return (
    <div className="space-y-4">
      {err && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      {mode === "vendors" && (
        <>
          <Card title="Vendors List" actions={<Button onClick={load}>Refresh</Button>}>
            <form onSubmit={createVendor} className="mb-4 grid gap-2 md:grid-cols-4">
              <Input placeholder="Vendor Name" value={vendorForm.name} onChange={(e) => setVendorForm((p: any) => ({ ...p, name: e.target.value }))} required />
              <Input placeholder="Contact Person" value={vendorForm.contact_person} onChange={(e) => setVendorForm((p: any) => ({ ...p, contact_person: e.target.value }))} />
              <Input placeholder="Phone" value={vendorForm.phone} onChange={(e) => setVendorForm((p: any) => ({ ...p, phone: e.target.value }))} />
              <Input placeholder="Email" value={vendorForm.email} onChange={(e) => setVendorForm((p: any) => ({ ...p, email: e.target.value }))} />
              <Input placeholder="GST No" value={vendorForm.gst_no} onChange={(e) => setVendorForm((p: any) => ({ ...p, gst_no: e.target.value }))} />
              <Input placeholder="Address" value={vendorForm.address} onChange={(e) => setVendorForm((p: any) => ({ ...p, address: e.target.value }))} />
              <Select value={vendorForm.status} onChange={(e) => setVendorForm((p: any) => ({ ...p, status: e.target.value }))}><option>ACTIVE</option><option>INACTIVE</option></Select>
              <Button type="submit" variant="primary">Create Vendor</Button>
            </form>
            <TableShell
              headers={["Vendor", "Contact", "GST", "Status", "Actions"]}
              rows={vendors.map((v: any) => (
                <tr key={v.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{v.name}</td>
                  <td className="px-4 py-3">{v.contact_person || v.phone || "-"}</td>
                  <td className="px-4 py-3">{v.gst_no || "-"}</td>
                  <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                  <td className="px-4 py-3"><button className="enterprise-btn" onClick={() => deleteVendor(v.id)}>Delete</button></td>
                </tr>
              ))}
            />
          </Card>

          <Card title="Vendor Vehicles">
            <form onSubmit={createVendorVehicle} className="mb-4 grid gap-2 md:grid-cols-5">
              <Select value={vendorVehicleForm.vendor_id} onChange={(e) => setVendorVehicleForm((p: any) => ({ ...p, vendor_id: e.target.value }))} required>
                <option value="">Select vendor</option>
                {vendors.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </Select>
              <Input placeholder="Vehicle No" value={vendorVehicleForm.vehicle_no} onChange={(e) => setVendorVehicleForm((p: any) => ({ ...p, vehicle_no: e.target.value }))} required />
              <Input placeholder="Vehicle Type" value={vendorVehicleForm.vehicle_type} onChange={(e) => setVendorVehicleForm((p: any) => ({ ...p, vehicle_type: e.target.value }))} />
              <Input placeholder="Capacity Tons" value={vendorVehicleForm.capacity_tons} onChange={(e) => setVendorVehicleForm((p: any) => ({ ...p, capacity_tons: e.target.value }))} />
              <Button type="submit" variant="primary">Add Vehicle</Button>
            </form>
            <TableShell
              headers={["Vendor", "Vehicle No", "Type", "Capacity", "Status"]}
              rows={vendorVehicles.map((vv: any) => (
                <tr key={vv.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{vv.vendor_name || "-"}</td>
                  <td className="px-4 py-3 font-medium">{vv.vehicle_no}</td>
                  <td className="px-4 py-3">{vv.vehicle_type || "-"}</td>
                  <td className="px-4 py-3">{vv.capacity_tons || "-"}</td>
                  <td className="px-4 py-3"><StatusBadge status={vv.status} /></td>
                </tr>
              ))}
            />
          </Card>
        </>
      )}

      {mode === "subcontract" && (
        <Card title="Subcontract Trips" actions={<Button onClick={load}>Refresh</Button>}>
          <form onSubmit={createSubcontractTrip} className="mb-4 grid gap-2 md:grid-cols-4">
            <Select value={subTripForm.vendor_id} onChange={(e) => setSubTripForm((p: any) => ({ ...p, vendor_id: e.target.value }))} required>
              <option value="">Select vendor</option>
              {vendors.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </Select>
            <Select value={subTripForm.vendor_vehicle_id} onChange={(e) => setSubTripForm((p: any) => ({ ...p, vendor_vehicle_id: e.target.value }))}>
              <option value="">Select vendor vehicle</option>
              {vendorVehicles.filter((vv: any) => String(vv.vendor_id) === String(subTripForm.vendor_id)).map((vv: any) => <option key={vv.id} value={vv.id}>{vv.vehicle_no}</option>)}
            </Select>
            <Select value={subTripForm.trip_id} onChange={(e) => setSubTripForm((p: any) => ({ ...p, trip_id: e.target.value }))}>
              <option value="">Select trip</option>
              {trips.map((t: any) => <option key={t.id} value={t.id}>{t.trip_code}</option>)}
            </Select>
            <Input placeholder="Freight Amount" value={subTripForm.freight_amount} onChange={(e) => setSubTripForm((p: any) => ({ ...p, freight_amount: e.target.value }))} required />
            <Input type="date" value={subTripForm.assigned_on} onChange={(e) => setSubTripForm((p: any) => ({ ...p, assigned_on: e.target.value }))} required />
            <Select value={subTripForm.status} onChange={(e) => setSubTripForm((p: any) => ({ ...p, status: e.target.value }))}>
              {["PLANNED", "ASSIGNED", "IN_TRANSIT", "DELIVERED", "SETTLED", "CANCELLED"].map((s) => <option key={s}>{s}</option>)}
            </Select>
            <Input placeholder="Note" value={subTripForm.note} onChange={(e) => setSubTripForm((p: any) => ({ ...p, note: e.target.value }))} />
            <Button type="submit" variant="primary">Create Subcontract</Button>
          </form>
          <TableShell
            headers={["Trip", "Vendor", "Vehicle", "Freight", "Status"]}
            rows={subTrips.map((st: any) => (
              <tr key={st.id} className="border-t border-slate-100">
                <td className="px-4 py-3">{st.trip_code || "-"}</td>
                <td className="px-4 py-3">{st.vendor_name || "-"}</td>
                <td className="px-4 py-3">{st.vendor_vehicle_no || "-"}</td>
                <td className="px-4 py-3">{st.freight_amount || 0}</td>
                <td className="px-4 py-3"><StatusBadge status={st.status} /></td>
              </tr>
            ))}
          />
        </Card>
      )}

      {mode === "commission" && (
        <>
          <Card title="Brokers">
            <form onSubmit={createBroker} className="mb-4 grid gap-2 md:grid-cols-5">
              <Input placeholder="Broker Name" value={brokerForm.name} onChange={(e) => setBrokerForm((p: any) => ({ ...p, name: e.target.value }))} required />
              <Input placeholder="Phone" value={brokerForm.phone} onChange={(e) => setBrokerForm((p: any) => ({ ...p, phone: e.target.value }))} />
              <Input placeholder="Email" value={brokerForm.email} onChange={(e) => setBrokerForm((p: any) => ({ ...p, email: e.target.value }))} />
              <Select value={brokerForm.commission_type} onChange={(e) => setBrokerForm((p: any) => ({ ...p, commission_type: e.target.value }))}><option>PERCENTAGE</option><option>FIXED</option></Select>
              <Button type="submit" variant="primary">Create Broker</Button>
            </form>
            <TableShell
              headers={["Broker", "Phone", "Type", "Status", "Actions"]}
              rows={brokers.map((b: any) => (
                <tr key={b.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{b.name}</td>
                  <td className="px-4 py-3">{b.phone || "-"}</td>
                  <td className="px-4 py-3">{b.commission_type}</td>
                  <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  <td className="px-4 py-3"><button className="enterprise-btn" onClick={() => deleteBroker(b.id)}>Delete</button></td>
                </tr>
              ))}
            />
          </Card>

          <Card title="Broker Commission">
            <form onSubmit={createBrokerCommission} className="mb-4 grid gap-2 md:grid-cols-4">
              <Select value={brokerCommissionForm.broker_id} onChange={(e) => setBrokerCommissionForm((p: any) => ({ ...p, broker_id: e.target.value }))} required>
                <option value="">Select broker</option>
                {brokers.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </Select>
              <Select value={brokerCommissionForm.trip_id} onChange={(e) => setBrokerCommissionForm((p: any) => ({ ...p, trip_id: e.target.value }))}>
                <option value="">Select trip</option>
                {trips.map((t: any) => <option key={t.id} value={t.id}>{t.trip_code}</option>)}
              </Select>
              <Select value={brokerCommissionForm.commission_type} onChange={(e) => setBrokerCommissionForm((p: any) => ({ ...p, commission_type: e.target.value }))}><option>PERCENTAGE</option><option>FIXED</option></Select>
              <Input placeholder="Commission Value" value={brokerCommissionForm.commission_value} onChange={(e) => setBrokerCommissionForm((p: any) => ({ ...p, commission_value: e.target.value }))} required />
              <Input placeholder="Commission Amount" value={brokerCommissionForm.commission_amount} onChange={(e) => setBrokerCommissionForm((p: any) => ({ ...p, commission_amount: e.target.value }))} required />
              <Select value={brokerCommissionForm.status} onChange={(e) => setBrokerCommissionForm((p: any) => ({ ...p, status: e.target.value }))}><option>PENDING</option><option>PAID</option></Select>
              <Input placeholder="Note" value={brokerCommissionForm.note} onChange={(e) => setBrokerCommissionForm((p: any) => ({ ...p, note: e.target.value }))} />
              <Button type="submit" variant="primary">Create Commission</Button>
            </form>
            <TableShell
              headers={["Broker", "Trip", "Amount", "Status"]}
              rows={brokerCommissions.map((bc: any) => (
                <tr key={bc.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{bc.broker_name || "-"}</td>
                  <td className="px-4 py-3">{bc.trip_code || "-"}</td>
                  <td className="px-4 py-3">{bc.commission_amount || 0}</td>
                  <td className="px-4 py-3"><StatusBadge status={bc.status} /></td>
                </tr>
              ))}
            />
          </Card>

          <Card title="Vendor Settlement">
            <form onSubmit={createVendorSettlement} className="mb-4 grid gap-2 md:grid-cols-4">
              <Select value={vendorSettlementForm.vendor_id} onChange={(e) => setVendorSettlementForm((p: any) => ({ ...p, vendor_id: e.target.value }))} required>
                <option value="">Select vendor</option>
                {vendors.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </Select>
              <Input type="date" value={vendorSettlementForm.settlement_date} onChange={(e) => setVendorSettlementForm((p: any) => ({ ...p, settlement_date: e.target.value }))} required />
              <Input placeholder="Gross Amount" value={vendorSettlementForm.gross_amount} onChange={(e) => setVendorSettlementForm((p: any) => ({ ...p, gross_amount: e.target.value }))} required />
              <Input placeholder="Deductions" value={vendorSettlementForm.deductions} onChange={(e) => setVendorSettlementForm((p: any) => ({ ...p, deductions: e.target.value }))} />
              <Select value={vendorSettlementForm.status} onChange={(e) => setVendorSettlementForm((p: any) => ({ ...p, status: e.target.value }))}><option>PENDING</option><option>PAID</option></Select>
              <Input placeholder="Note" value={vendorSettlementForm.note} onChange={(e) => setVendorSettlementForm((p: any) => ({ ...p, note: e.target.value }))} />
              <Button type="submit" variant="primary">Create Settlement</Button>
            </form>
            <TableShell
              headers={["Vendor", "Date", "Net Amount", "Status"]}
              rows={vendorSettlements.map((vs: any) => (
                <tr key={vs.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{vs.vendor_name || "-"}</td>
                  <td className="px-4 py-3">{vs.settlement_date}</td>
                  <td className="px-4 py-3">{vs.net_amount || 0}</td>
                  <td className="px-4 py-3"><StatusBadge status={vs.status} /></td>
                </tr>
              ))}
            />
          </Card>
        </>
      )}
    </div>
  );
}
