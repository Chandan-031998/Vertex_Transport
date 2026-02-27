import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Fleet from "./pages/Fleet";
import Drivers from "./pages/Drivers";
import Trips from "./pages/Trips";
import Billing from "./pages/Billing";
import Reports from "./pages/Reports";
import Phase2 from "./pages/Phase2";
import Roles from "./pages/Roles";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Forbidden from "./pages/Forbidden";
import VendorBroker from "./pages/VendorBroker";
import Compliance from "./pages/Compliance";
import SystemLogs from "./pages/SystemLogs";
import FleetMaintenanceTyres from "./pages/FleetMaintenanceTyres";
import FleetFuelBreakdowns from "./pages/FleetFuelBreakdowns";
import DriversKycAttendance from "./pages/DriversKycAttendance";
import DriversSettlementsPerformance from "./pages/DriversSettlementsPerformance";
import TripsPodExpenses from "./pages/TripsPodExpenses";
import TripsReturnLoads from "./pages/TripsReturnLoads";
import BillingOutstanding from "./pages/BillingOutstanding";
import BillingExport from "./pages/BillingExport";
import DriverTrips from "./pages/DriverTrips";
import DriverPodExpenses from "./pages/DriverPodExpenses";
import DriverSettlements from "./pages/DriverSettlements";
import ProtectedRoute from "./auth/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import { useAuth } from "./auth/AuthProvider";
import { Permissions } from "./constants/permissions";

function AuthedApp() {
  const { user } = useAuth();
  const isDriver = user?.role === "DRIVER";

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<ProtectedRoute anyOf={[Permissions.DASHBOARD_VIEW]}><Dashboard /></ProtectedRoute>} />

        <Route path="/fleet" element={<Navigate to="/fleet/vehicles-documents" replace />} />
        <Route path="/fleet/vehicles-documents" element={<ProtectedRoute anyOf={[Permissions.FLEET_VIEW]}><Fleet /></ProtectedRoute>} />
        <Route path="/fleet/maintenance-tyres" element={<ProtectedRoute anyOf={[Permissions.FLEET_VIEW]}><FleetMaintenanceTyres /></ProtectedRoute>} />
        <Route path="/fleet/fuel-breakdowns" element={<ProtectedRoute anyOf={[Permissions.FLEET_VIEW]}><FleetFuelBreakdowns /></ProtectedRoute>} />

        <Route path="/drivers" element={<Navigate to="/drivers/list" replace />} />
        <Route path="/drivers/list" element={<ProtectedRoute anyOf={[Permissions.DRIVERS_VIEW]}><Drivers /></ProtectedRoute>} />
        <Route path="/drivers/kyc-attendance" element={<ProtectedRoute anyOf={[Permissions.DRIVERS_VIEW]}><DriversKycAttendance /></ProtectedRoute>} />
        <Route path="/drivers/settlements-performance" element={<ProtectedRoute anyOf={[Permissions.DRIVERS_VIEW]}><DriversSettlementsPerformance /></ProtectedRoute>} />

        <Route path="/trips" element={<Navigate to={isDriver ? "/driver/trips" : "/trips/planning"} replace />} />
        <Route path="/trips/planning" element={<ProtectedRoute anyOf={[Permissions.TRIPS_VIEW]}>{isDriver ? <Navigate to="/driver/trips" replace /> : <Trips />}</ProtectedRoute>} />
        <Route path="/trips/pod-expenses" element={<ProtectedRoute anyOf={[Permissions.TRIPS_VIEW]}>{isDriver ? <Navigate to="/driver/pod-expenses" replace /> : <TripsPodExpenses />}</ProtectedRoute>} />
        <Route path="/trips/return-loads" element={<ProtectedRoute anyOf={[Permissions.TRIPS_VIEW]}>{isDriver ? <Navigate to="/driver/past-trips" replace /> : <TripsReturnLoads />}</ProtectedRoute>} />

        <Route path="/driver/trips" element={<ProtectedRoute anyOf={[Permissions.TRIPS_VIEW]}><DriverTrips mode="active" /></ProtectedRoute>} />
        <Route path="/driver/pod-expenses" element={<ProtectedRoute anyOf={[Permissions.TRIPS_PODS_MANAGE, Permissions.TRIPS_EXPENSES_MANAGE]}><DriverPodExpenses /></ProtectedRoute>} />
        <Route path="/driver/past-trips" element={<ProtectedRoute anyOf={[Permissions.TRIPS_VIEW]}><DriverTrips mode="past" /></ProtectedRoute>} />
        <Route path="/driver/settlements" element={<ProtectedRoute anyOf={[Permissions.DRIVER_SETTLEMENTS_VIEW]}><DriverSettlements /></ProtectedRoute>} />

        <Route path="/billing" element={<Navigate to="/billing/customers-invoices" replace />} />
        <Route path="/billing/customers-invoices" element={<ProtectedRoute anyOf={[Permissions.BILLING_CUSTOMERS_VIEW, Permissions.BILLING_INVOICES_VIEW]}><Billing /></ProtectedRoute>} />
        <Route path="/billing/outstanding" element={<ProtectedRoute anyOf={[Permissions.BILLING_INVOICES_VIEW]}><BillingOutstanding /></ProtectedRoute>} />
        <Route path="/billing/export" element={<ProtectedRoute anyOf={[Permissions.BILLING_EXPORT, Permissions.BILLING_INVOICES_VIEW]}><BillingExport /></ProtectedRoute>} />

        <Route path="/reports" element={<Navigate to="/reports/utilization" replace />} />
        <Route path="/reports/utilization" element={<ProtectedRoute anyOf={[Permissions.REPORTS_VIEW]}><Reports /></ProtectedRoute>} />
        <Route path="/reports/profitability" element={<ProtectedRoute anyOf={[Permissions.REPORTS_VIEW]}><Reports /></ProtectedRoute>} />
        <Route path="/reports/pl" element={<ProtectedRoute anyOf={[Permissions.REPORTS_VIEW]}><Reports /></ProtectedRoute>} />

        <Route path="/vendor-broker/vendors-list" element={<ProtectedRoute anyOf={[Permissions.PHASE2_VIEW]}><VendorBroker /></ProtectedRoute>} />
        <Route path="/vendor-broker/subcontract-trips" element={<ProtectedRoute anyOf={[Permissions.PHASE2_VIEW]}><VendorBroker /></ProtectedRoute>} />
        <Route path="/vendor-broker/commission-settlement" element={<ProtectedRoute anyOf={[Permissions.PHASE2_VIEW]}><VendorBroker /></ProtectedRoute>} />

        <Route path="/compliance/document-tracker" element={<ProtectedRoute anyOf={[Permissions.PHASE2_VIEW]}><Compliance /></ProtectedRoute>} />
        <Route path="/compliance/fastag-road-tax" element={<ProtectedRoute anyOf={[Permissions.PHASE2_VIEW]}><Compliance /></ProtectedRoute>} />
        <Route path="/compliance/alerts" element={<ProtectedRoute anyOf={[Permissions.PHASE2_VIEW]}><Compliance /></ProtectedRoute>} />

        <Route path="/phase2" element={<ProtectedRoute anyOf={[Permissions.PHASE2_VIEW]}><Phase2 /></ProtectedRoute>} />
        <Route path="/roles" element={<ProtectedRoute anyOf={[Permissions.ROLES_VIEW, Permissions.ROLES_MANAGE]}><Roles /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute anyOf={[Permissions.USERS_VIEW, Permissions.USERS_MANAGE]}><Users /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute anyOf={[Permissions.SETTINGS_VIEW, Permissions.SETTINGS_MANAGE]}><Settings /></ProtectedRoute>} />
        <Route path="/system-logs" element={<ProtectedRoute anyOf={[Permissions.AUDIT_VIEW, Permissions.USERS_VIEW]}><SystemLogs /></ProtectedRoute>} />

        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  const { token } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AuthedApp />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
