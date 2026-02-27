import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { Permissions } from "../constants/permissions";
import { Button, PageHeader } from "../components/ui";
import { useTheme } from "../theme/ThemeProvider";

type NavGroup = {
  title: string;
  permission?: string[];
  items: Array<{ to: string; label: string }>;
};

const groups: NavGroup[] = [
  { title: "Dashboard", permission: [Permissions.DASHBOARD_VIEW], items: [{ to: "/", label: "KPI Overview" }] },
  {
    title: "Fleet Management",
    permission: [Permissions.FLEET_VIEW],
    items: [
      { to: "/fleet/vehicles-documents", label: "Vehicles & Documents" },
      { to: "/fleet/maintenance-tyres", label: "Maintenance & Tyres" },
      { to: "/fleet/fuel-breakdowns", label: "Fuel & Breakdowns" },
    ],
  },
  {
    title: "Driver Management",
    permission: [Permissions.DRIVERS_VIEW],
    items: [
      { to: "/drivers/list", label: "Drivers List" },
      { to: "/drivers/kyc-attendance", label: "KYC & Attendance" },
      { to: "/drivers/settlements-performance", label: "Settlements & Performance" },
    ],
  },
  {
    title: "Trips & Loads",
    permission: [Permissions.TRIPS_VIEW],
    items: [
      { to: "/trips/planning", label: "Trip Planning" },
      { to: "/trips/pod-expenses", label: "POD & Expenses" },
      { to: "/trips/return-loads", label: "Return Loads" },
    ],
  },
  {
    title: "Billing & Accounts",
    permission: [Permissions.BILLING_CUSTOMERS_VIEW, Permissions.BILLING_INVOICES_VIEW],
    items: [
      { to: "/billing/customers-invoices", label: "Customers & Invoices" },
      { to: "/billing/outstanding", label: "Outstanding & Payments" },
      { to: "/billing/export", label: "Export" },
    ],
  },
  {
    title: "Vendor & Broker",
    permission: [Permissions.PHASE2_VIEW],
    items: [
      { to: "/vendor-broker/vendors-list", label: "Vendors List" },
      { to: "/vendor-broker/subcontract-trips", label: "Subcontract Trips" },
      { to: "/vendor-broker/commission-settlement", label: "Commission & Settlement" },
    ],
  },
  {
    title: "Compliance",
    permission: [Permissions.PHASE2_VIEW],
    items: [
      { to: "/compliance/document-tracker", label: "Document Tracker" },
      { to: "/compliance/fastag-road-tax", label: "FASTag & Road Tax" },
      { to: "/compliance/alerts", label: "Alerts" },
    ],
  },
  {
    title: "Reports & Analytics",
    permission: [Permissions.REPORTS_VIEW],
    items: [
      { to: "/reports/utilization", label: "Utilization" },
      { to: "/reports/profitability", label: "Profitability" },
      { to: "/reports/pl", label: "P&L" },
    ],
  },
  {
    title: "Administration",
    permission: [Permissions.USERS_VIEW, Permissions.SETTINGS_VIEW],
    items: [
      { to: "/users", label: "Users" },
      { to: "/roles", label: "Roles & Permissions" },
      { to: "/settings", label: "Company Settings" },
      { to: "/system-logs", label: "System Logs" },
    ],
  },
];

const driverGroups: NavGroup[] = [
  { title: "Driver Dashboard", permission: [Permissions.DASHBOARD_VIEW], items: [{ to: "/", label: "Overview" }] },
  {
    title: "Trips",
    permission: [Permissions.TRIPS_VIEW],
    items: [
      { to: "/driver/trips", label: "Assigned Trips" },
      { to: "/driver/pod-expenses", label: "POD & Expenses" },
      { to: "/driver/past-trips", label: "Past Trips" },
    ],
  },
  {
    title: "Settlements",
    permission: [Permissions.DRIVER_SETTLEMENTS_VIEW],
    items: [{ to: "/driver/settlements", label: "Settlement Summary" }],
  },
];

const iconMap: Record<string, string> = {
  Dashboard: "DB",
  "Fleet Management": "FL",
  "Driver Management": "DR",
  "Trips & Loads": "TR",
  "Billing & Accounts": "BL",
  "Vendor & Broker": "VB",
  Compliance: "CP",
  "Reports & Analytics": "RP",
  Administration: "AD",
  "Driver Dashboard": "DB",
  Trips: "TR",
  Settlements: "ST",
};

function GroupIcon({ title }: { title: string }) {
  return (
    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-slate-100 px-1 text-[11px] font-semibold text-slate-500">
      {iconMap[title] || "•"}
    </span>
  );
}

function SidebarContent({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const { hasPermission, user } = useAuth();
  const location = useLocation();
  const navGroups = user?.role === "DRIVER" ? driverGroups : groups;
  const visibleGroups = navGroups.filter((g) => !g.permission || hasPermission(...g.permission));
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const activeGroup = useMemo(() => {
    const path = location.pathname;
    return visibleGroups.find((group) => group.items.some((i) => path === i.to || path.startsWith(`${i.to}/`)))?.title;
  }, [location.pathname, visibleGroups]);

  useEffect(() => {
    setOpen((prev) => {
      const next: Record<string, boolean> = {};
      for (const group of visibleGroups) {
        next[group.title] = prev[group.title] ?? true;
      }
      if (activeGroup) next[activeGroup] = true;
      return next;
    });
  }, [activeGroup, visibleGroups]);

  return (
    <div className="space-y-6">
      {visibleGroups.map((group) => (
        <section key={group.title}>
          {!collapsed && (
            <button
              type="button"
              onClick={() => setOpen((prev) => ({ ...prev, [group.title]: !prev[group.title] }))}
              className="mb-2 flex w-full items-center justify-between rounded-xl px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400 hover:bg-white/80"
            >
              <span className="flex items-center gap-2">
                <GroupIcon title={group.title} />
                {group.title}
              </span>
              <span>{open[group.title] ? "−" : "+"}</span>
            </button>
          )}

          <div className={`space-y-1 ${!collapsed && !open[group.title] ? "hidden" : ""}`}>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                onClick={onNavigate}
                className={({ isActive }) =>
                  `group flex items-center gap-2 rounded-2xl px-3 py-3 text-[15px] leading-none transition ${
                    isActive ? "enterprise-active-pill" : "text-slate-600 hover:bg-white"
                  }`
                }
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                {!collapsed ? <span className="truncate">{item.label}</span> : null}
              </NavLink>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const pageTitle = useMemo(() => {
    const p = location.pathname;
    if (p.startsWith("/fleet")) return "Fleet Management";
    if (p.startsWith("/drivers")) return "Driver Management";
    if (p.startsWith("/trips")) return "Trip & Load Management";
    if (p.startsWith("/driver")) return "Driver Workspace";
    if (p.startsWith("/billing")) return "Billing & Accounts";
    if (p.startsWith("/vendor-broker")) return "Vendor & Broker Management";
    if (p.startsWith("/compliance")) return "Compliance Management";
    if (p.startsWith("/reports")) return "Reports & Analytics";
    if (p.startsWith("/users")) return "Users";
    if (p.startsWith("/roles")) return "Roles & Permissions";
    if (p.startsWith("/settings")) return "Company Settings";
    if (p.startsWith("/system-logs")) return "System Logs";
    return "Dashboard";
  }, [location.pathname]);

  const mobileNav = user?.role === "DRIVER"
    ? [
        { to: "/", label: "Home" },
        { to: "/driver/trips", label: "Trips" },
        { to: "/driver/pod-expenses", label: "POD" },
        { to: "/driver/past-trips", label: "Past" },
        { to: "/driver/settlements", label: "Settle" },
      ]
    : [
        { to: "/", label: "Home" },
        { to: "/fleet/vehicles-documents", label: "Fleet" },
        { to: "/trips/planning", label: "Trips" },
        { to: "/billing/customers-invoices", label: "Billing" },
        { to: "/users", label: "Admin" },
      ];

  return (
    <div className="enterprise-shell">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button className="md:hidden" onClick={() => setDrawerOpen(true)}>Menu</Button>
            <Button className="hidden md:inline-flex" onClick={() => setCollapsed((v) => !v)}>
              {collapsed ? "Expand" : "Collapse"}
            </Button>
            <Link to="/" className="truncate text-xl font-semibold tracking-tight text-slate-900">
              {theme.brand_name || "Vertex Demo Company"}
            </Link>
            <span className="hidden rounded-full border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 md:inline-flex">
              Enterprise Admin
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input className="enterprise-input hidden w-80 lg:block" placeholder="Search trips, invoices, drivers..." />
            <Button className="hidden sm:inline-flex">Notifications</Button>
            <div className="hidden rounded-xl border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-600 lg:block">
              {user?.email} • {user?.role_name || user?.role}
            </div>
            <Button onClick={logout}>Logout</Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1600px] gap-6 px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        <aside className={`${collapsed ? "md:w-24" : "md:w-80"} hidden shrink-0 md:block`}>
          <div className="sticky top-24 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
            <SidebarContent collapsed={collapsed} />
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <PageHeader title={pageTitle} breadcrumb={theme.brand_name || "Vertex Demo Company"} />
          <div className="space-y-6">{children}</div>
        </main>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/50 bg-white/85 p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        <div className="grid grid-cols-5 gap-1 text-xs">
          {mobileNav.map((i) => (
            <NavLink
              key={i.to}
              to={i.to}
              className={({ isActive }) =>
                `rounded-xl px-2 py-2 text-center transition ${isActive ? "enterprise-active-pill" : "text-slate-600"}`
              }
            >
              {i.label}
            </NavLink>
          ))}
        </div>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-slate-900/30" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[88vw] max-w-sm border-r border-slate-200/70 bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-semibold text-slate-900">Navigation</p>
              <Button onClick={() => setDrawerOpen(false)}>Close</Button>
            </div>
            <SidebarContent collapsed={false} onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
