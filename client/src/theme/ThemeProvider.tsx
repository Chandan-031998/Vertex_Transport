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
  dark_mode: boolean;
};

type ThemeCtx = {
  theme: ThemeState;
  setTheme: (patch: Partial<ThemeState>) => void;
  reloadTheme: () => Promise<void>;
  toggleDarkMode: () => void;
};

const defaults: ThemeState = {
  brand_name: "Vertex Transport Manager",
  logo_url: null,
  primary_color: "#4f46e5",
  secondary_color: "#06b6d4",
  ui_style: "SOFT",
  dark_mode: false,
};

const Ctx = createContext<ThemeCtx | null>(null);

function applyThemeToDom(theme: ThemeState) {
  const root = document.documentElement;
  root.style.setProperty("--brand", theme.primary_color || defaults.primary_color || "#4f46e5");
  root.style.setProperty("--brand-2", theme.secondary_color || defaults.secondary_color || "#06b6d4");
  root.dataset.uiStyle = String(theme.ui_style || "SOFT").toLowerCase();
  if (theme.dark_mode) root.classList.add("dark");
  else root.classList.remove("dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [theme, setThemeState] = useState<ThemeState>(defaults);

  const setTheme = (patch: Partial<ThemeState>) => {
    setThemeState((prev) => {
      const next = { ...prev, ...patch };
      applyThemeToDom(next);
      localStorage.setItem("vertex-theme", JSON.stringify(next));
      return next;
    });
  };

  const toggleDarkMode = () => {
    setThemeState((prev) => {
      const next = { ...prev, dark_mode: !prev.dark_mode };
      applyThemeToDom(next);
      localStorage.setItem("vertex-theme", JSON.stringify(next));
      return next;
    });
  };

  const reloadTheme = async () => {
    const saved = localStorage.getItem("vertex-theme");
    const savedTheme: Partial<ThemeState> = saved ? JSON.parse(saved) : {};

    if (!token) {
      const next = { ...defaults, ...savedTheme };
      setThemeState(next);
      applyThemeToDom(next);
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
        ui_style: (data.ui_style || "SOFT") as UiStyle,
        dark_mode: typeof savedTheme.dark_mode === "boolean" ? savedTheme.dark_mode : defaults.dark_mode,
      };
      setThemeState(next);
      applyThemeToDom(next);
      localStorage.setItem("vertex-theme", JSON.stringify(next));
    } catch {
      const next = { ...defaults, ...savedTheme };
      setThemeState(next);
      applyThemeToDom(next);
    }
  };

  useEffect(() => {
    reloadTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const value = useMemo(() => ({ theme, setTheme, reloadTheme, toggleDarkMode }), [theme]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
