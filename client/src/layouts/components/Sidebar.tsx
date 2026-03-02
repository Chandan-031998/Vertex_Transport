import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import type { NavGroup } from "../config/navigation";

type SidebarProps = {
  collapsed: boolean;
  groups: NavGroup[];
  onNavigate?: () => void;
};

export default function Sidebar({ collapsed, groups, onNavigate }: SidebarProps) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const location = useLocation();

  const activeGroup = useMemo(() => {
    const path = location.pathname;
    return groups.find((group) => group.items.some((i) => path === i.to || path.startsWith(`${i.to}/`)))?.title;
  }, [groups, location.pathname]);

  useEffect(() => {
    setOpen((prev) => {
      const next: Record<string, boolean> = {};
      for (const group of groups) {
        next[group.title] = prev[group.title] ?? true;
      }
      if (activeGroup) next[activeGroup] = true;
      return next;
    });
  }, [groups, activeGroup]);

  return (
    <aside className="rounded-2xl border border-white/40 bg-white/55 p-3 shadow-glass backdrop-blur-sm dark:bg-slate-900/55">
      <div className="space-y-4">
        {groups.map((group) => {
          const GroupIcon = group.icon;
          const isExpanded = open[group.title] || collapsed;
          return (
            <section key={group.title}>
              <button
                type="button"
                onClick={() => setOpen((prev) => ({ ...prev, [group.title]: !prev[group.title] }))}
                className="mb-2 flex w-full items-center justify-between rounded-xl px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 transition hover:bg-white/60 dark:hover:bg-slate-800/80"
              >
                <span className="flex items-center gap-2">
                  <span className="rounded-lg bg-slate-100 p-1 text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                    <GroupIcon size={14} />
                  </span>
                  {!collapsed ? group.title : null}
                </span>
                {!collapsed ? (
                  <ChevronDown size={14} className={`transition ${isExpanded ? "rotate-180" : ""}`} />
                ) : null}
              </button>

              <AnimatePresence initial={false}>
                {isExpanded ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1 overflow-hidden"
                  >
                    {group.items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end
                        onClick={onNavigate}
                        className={({ isActive }) =>
                          `group relative flex items-center gap-3 overflow-visible rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                            isActive
                              ? "bg-gradient-to-r from-indigo-500/90 to-cyan-500/90 text-white shadow-md"
                              : "text-slate-600 hover:bg-white/75 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <motion.span
                              layout
                              className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-white" : "bg-slate-400"}`}
                              whileHover={{ scale: 1.2 }}
                            />
                            {!collapsed ? <span className="truncate">{item.label}</span> : null}
                            {collapsed ? (
                              <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-xs text-white shadow-lg group-hover:block">
                                {item.label}
                              </span>
                            ) : null}
                            {isActive ? (
                              <motion.span
                                layoutId="active-indicator"
                                className="absolute inset-y-1 left-1 w-1 rounded-full bg-white/90"
                              />
                            ) : null}
                          </>
                        )}
                      </NavLink>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </section>
          );
        })}
      </div>
    </aside>
  );
}
