import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Search,
  Sparkles,
  Sun,
  SwatchBook,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui";
import { useTheme } from "../../theme/ThemeProvider";

type HeaderProps = {
  collapsed: boolean;
  onToggleSidebar: () => void;
  onOpenDrawer: () => void;
  onLogout: () => void;
  userEmail?: string;
  roleName?: string;
};

export default function Header({
  collapsed,
  onToggleSidebar,
  onOpenDrawer,
  onLogout,
  userEmail,
  roleName,
}: HeaderProps) {
  const { theme, toggleDarkMode } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = useMemo(() => {
    const source = theme.brand_name || userEmail || "Vertex";
    return source
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [theme.brand_name, userEmail]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-white/70 backdrop-blur-sm dark:bg-slate-950/65">
      <div className="mx-auto flex w-full max-w-[1700px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <Button className="md:hidden" onClick={onOpenDrawer}>
            <Menu size={16} />
          </Button>
          <Button className="hidden md:inline-flex" onClick={onToggleSidebar}>
            {collapsed ? "Expand" : "Collapse"}
          </Button>

          <Link to="/" className="flex min-w-0 items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-xl border border-white/50 bg-white/80 shadow-sm">
              {theme.logo_url ? (
                <img src={theme.logo_url} alt="Company logo" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-500 to-cyan-500 text-sm font-bold text-white">
                  VT
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">{theme.brand_name || "Vertex Transport Manager"}</p>
              <p className="hidden text-xs uppercase tracking-[0.18em] text-slate-400 sm:block">Investor-ready operations cloud</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <label className="hidden items-center gap-2 rounded-xl border border-white/40 bg-white/70 px-3 py-2 text-sm text-slate-500 shadow-sm lg:flex dark:bg-slate-900/60 dark:text-slate-300">
            <Search size={15} />
            <input className="w-56 bg-transparent outline-none" placeholder="Search vehicles, trips, invoices" />
          </label>

          <motion.button
            whileHover={{ scale: 1.03 }}
            type="button"
            onClick={toggleDarkMode}
            className="rounded-xl border border-white/40 bg-white/70 p-2 text-slate-700 shadow-sm transition hover:bg-white dark:bg-slate-900/70 dark:text-slate-200"
          >
            {theme.dark_mode ? <Sun size={16} /> : <Moon size={16} />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            type="button"
            className="hidden rounded-xl border border-white/40 bg-white/70 p-2 text-slate-700 shadow-sm transition hover:bg-white sm:inline-flex dark:bg-slate-900/70 dark:text-slate-200"
          >
            <Bell size={16} />
          </motion.button>

          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-xl border border-white/40 bg-white/75 p-1.5 pr-2 shadow-sm dark:bg-slate-900/70"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 text-xs font-semibold text-white">
                {initials}
              </span>
              <span className="hidden max-w-[180px] truncate text-sm text-slate-700 sm:block dark:text-slate-200">{userEmail || roleName || "User"}</span>
              <ChevronDown size={14} className="text-slate-500" />
            </motion.button>

            <AnimatePresence>
              {menuOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-white/40 bg-white/90 p-2 shadow-premium backdrop-blur-sm dark:bg-slate-900/90"
                >
                  <button type="button" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                    <SwatchBook size={15} />
                    Branding Studio
                  </button>
                  <button type="button" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                    <Sparkles size={15} />
                    Product Updates
                  </button>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-900/30"
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
