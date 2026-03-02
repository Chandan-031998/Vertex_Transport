import {
  Activity,
  BadgeDollarSign,
  BriefcaseBusiness,
  Car,
  ChartBar,
  FileCheck,
  Home,
  KeySquare,
  Route,
  Settings,
  ShieldCheck,
  Truck,
  UserCircle2,
  Users,
} from "lucide-react";
import { Permissions } from "../../constants/permissions";

export type NavItem = { to: string; label: string };

export type NavGroup = {
  title: string;
  permission?: string[];
  icon: typeof Home;
  items: NavItem[];
};

export const adminGroups: NavGroup[] = [
  { title: "Dashboard", permission: [Permissions.DASHBOARD_VIEW], icon: Home, items: [{ to: "/", label: "KPI Overview" }] },
  {
    title: "Fleet Management",
    permission: [Permissions.FLEET_VIEW],
    icon: Truck,
    items: [
      { to: "/fleet/vehicles-documents", label: "Vehicles & Documents" },
      { to: "/fleet/maintenance-tyres", label: "Maintenance & Tyres" },
      { to: "/fleet/fuel-breakdowns", label: "Fuel & Breakdowns" },
    ],
  },
  {
    title: "Driver Management",
    permission: [Permissions.DRIVERS_VIEW],
    icon: Users,
    items: [
      { to: "/drivers/list", label: "Drivers List" },
      { to: "/drivers/kyc-attendance", label: "KYC & Attendance" },
      { to: "/drivers/settlements-performance", label: "Settlements & Performance" },
    ],
  },
  {
    title: "Trips & Loads",
    permission: [Permissions.TRIPS_VIEW],
    icon: Route,
    items: [
      { to: "/trips/planning", label: "Trip Planning" },
      { to: "/trips/pod-expenses", label: "POD & Expenses" },
      { to: "/trips/return-loads", label: "Return Loads" },
    ],
  },
  {
    title: "Billing & Accounts",
    permission: [Permissions.BILLING_CUSTOMERS_VIEW, Permissions.BILLING_INVOICES_VIEW],
    icon: BadgeDollarSign,
    items: [
      { to: "/billing/customers-invoices", label: "Customers & Invoices" },
      { to: "/billing/outstanding", label: "Outstanding & Payments" },
      { to: "/billing/export", label: "Export" },
    ],
  },
  {
    title: "Vendor & Broker",
    permission: [Permissions.PHASE2_VIEW],
    icon: BriefcaseBusiness,
    items: [
      { to: "/vendor-broker/vendors-list", label: "Vendors List" },
      { to: "/vendor-broker/subcontract-trips", label: "Subcontract Trips" },
      { to: "/vendor-broker/commission-settlement", label: "Commission & Settlement" },
    ],
  },
  {
    title: "Compliance",
    permission: [Permissions.PHASE2_VIEW],
    icon: ShieldCheck,
    items: [
      { to: "/compliance/document-tracker", label: "Document Tracker" },
      { to: "/compliance/fastag-road-tax", label: "FASTag & Road Tax" },
      { to: "/compliance/alerts", label: "Alerts" },
    ],
  },
  {
    title: "Reports & Analytics",
    permission: [Permissions.REPORTS_VIEW],
    icon: ChartBar,
    items: [
      { to: "/reports/utilization", label: "Utilization" },
      { to: "/reports/profitability", label: "Profitability" },
      { to: "/reports/pl", label: "P&L" },
    ],
  },
  {
    title: "Administration",
    permission: [Permissions.USERS_VIEW, Permissions.SETTINGS_VIEW],
    icon: Settings,
    items: [
      { to: "/users", label: "Users" },
      { to: "/roles", label: "Roles & Permissions" },
      { to: "/settings", label: "Company Settings" },
      { to: "/system-logs", label: "System Logs" },
    ],
  },
];

export const driverGroups: NavGroup[] = [
  { title: "Driver Dashboard", permission: [Permissions.DASHBOARD_VIEW], icon: Home, items: [{ to: "/", label: "Overview" }] },
  {
    title: "Trips",
    permission: [Permissions.TRIPS_VIEW],
    icon: Car,
    items: [
      { to: "/driver/trips", label: "Assigned Trips" },
      { to: "/driver/pod-expenses", label: "POD & Expenses" },
      { to: "/driver/past-trips", label: "Past Trips" },
    ],
  },
  {
    title: "Settlements",
    permission: [Permissions.DRIVER_SETTLEMENTS_VIEW],
    icon: FileCheck,
    items: [{ to: "/driver/settlements", label: "Settlement Summary" }],
  },
];

export const mobileAdminNav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/fleet/vehicles-documents", label: "Fleet", icon: Truck },
  { to: "/trips/planning", label: "Trips", icon: Route },
  { to: "/billing/customers-invoices", label: "Billing", icon: BadgeDollarSign },
  { to: "/users", label: "Admin", icon: KeySquare },
];

export const mobileDriverNav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/driver/trips", label: "Trips", icon: Activity },
  { to: "/driver/pod-expenses", label: "POD", icon: FileCheck },
  { to: "/driver/past-trips", label: "Past", icon: Route },
  { to: "/driver/settlements", label: "Settle", icon: UserCircle2 },
];
