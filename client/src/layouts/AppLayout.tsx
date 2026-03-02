import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { PageHeader } from "../components/ui";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { adminGroups, driverGroups, mobileAdminNav, mobileDriverNav } from "./config/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isDriver = user?.role === "DRIVER";
  const navGroups = isDriver ? driverGroups : adminGroups;

  const visibleGroups = useMemo(
    () => navGroups.filter((g) => !g.permission || hasPermission(...g.permission)),
    [navGroups, hasPermission],
  );

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
    return "Executive Dashboard";
  }, [location.pathname]);

  const mobileNav = isDriver ? mobileDriverNav : mobileAdminNav;

  return (
    <div className="enterprise-shell relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 top-0 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl animate-float-slow" />
        <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl animate-float-slow" />
      </div>

      <Header
        collapsed={collapsed}
        onOpenDrawer={() => setDrawerOpen(true)}
        onToggleSidebar={() => setCollapsed((value) => !value)}
        onLogout={logout}
        userEmail={user?.email}
        roleName={user?.role_name || user?.role}
      />

      <div className="mx-auto flex w-full max-w-[1700px] gap-6 px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        <motion.aside
          animate={{ width: collapsed ? 104 : 320 }}
          transition={{ duration: 0.24, ease: "easeInOut" }}
          className="hidden shrink-0 md:block"
        >
          <div className="sticky top-24">
            <Sidebar collapsed={collapsed} groups={visibleGroups} />
          </div>
        </motion.aside>

        <main className="min-w-0 flex-1">
          <PageHeader title={pageTitle} breadcrumb="Vertex Transport Manager" />
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {children}
          </motion.div>
        </main>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/40 bg-white/70 p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur-sm md:hidden dark:bg-slate-900/70">
        <div className="grid grid-cols-5 gap-1 text-xs">
          {mobileNav.map((item) => {
            const MobileIcon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-xl px-2 py-1.5 text-center transition ${isActive ? "enterprise-active-pill" : "text-slate-600 dark:text-slate-300"}`
                }
              >
                <span className="mb-1 inline-flex justify-center">
                  <MobileIcon size={14} />
                </span>
                <span className="block truncate text-[11px]">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {drawerOpen ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-slate-900/35" onClick={() => setDrawerOpen(false)} />
            <motion.div
              initial={{ x: -28, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -28, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 top-0 h-full w-[88vw] max-w-sm p-3"
            >
              <Sidebar collapsed={false} groups={visibleGroups} onNavigate={() => setDrawerOpen(false)} />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
