import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { http } from "../api/http";
import { useAuth } from "../auth/AuthProvider";

type UiStyle = "CLASSIC" | "SOFT" | "GLASS";

type ThemeState = {
  brand_name: string;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  ui_style: UiStyle;
};

type ThemeCtx = {
  theme: ThemeState;
  setTheme: (patch: Partial<ThemeState>) => void;
  reloadTheme: () => Promise<void>;
};

const defaults: ThemeState = {
  brand_name: "Vertex Transport Manager",
  logo_url: null,
  primary_color: "#2563eb",
  secondary_color: "#1d4ed8",
  ui_style: "CLASSIC",
};

const Ctx = createContext<ThemeCtx | null>(null);

function applyThemeToDom(theme: ThemeState) {
  const root = document.documentElement;
  root.style.setProperty("--brand", theme.primary_color || defaults.primary_color || "#2563eb");
  root.style.setProperty("--brand-2", theme.secondary_color || defaults.secondary_color || "#1d4ed8");
  root.dataset.uiStyle = String(theme.ui_style || "CLASSIC").toLowerCase();
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [theme, setThemeState] = useState<ThemeState>(defaults);

  const setTheme = (patch: Partial<ThemeState>) => {
    setThemeState((prev) => {
      const next = { ...prev, ...patch };
      applyThemeToDom(next);
      return next;
    });
  };

  const reloadTheme = async () => {
    if (!token) {
      setThemeState(defaults);
      applyThemeToDom(defaults);
      return;
    }
    try {
      const res = await http.get("/settings/theme");
      const data = res.data?.data || {};
      const next: ThemeState = {
        brand_name: data.brand_name || defaults.brand_name,
        logo_url: data.logo_url || null,
        primary_color: data.primary_color || defaults.primary_color,
        secondary_color: data.secondary_color || defaults.secondary_color,
        ui_style: (data.ui_style || "CLASSIC") as UiStyle,
      };
      setThemeState(next);
      applyThemeToDom(next);
    } catch {
      setThemeState(defaults);
      applyThemeToDom(defaults);
    }
  };

  useEffect(() => {
    reloadTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const value = useMemo(() => ({ theme, setTheme, reloadTheme }), [theme]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
