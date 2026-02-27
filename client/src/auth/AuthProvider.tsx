import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { http } from "../api/http";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  role_name: string;
  role_id: number;
  driver_id?: number | null;
  permissions: string[];
  company_id: number | null;
};
type AuthCtx = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (...permissionCodes: string[]) => boolean;
  loading: boolean;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("vtm_token"));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMe = async () => {
    if (!token) { setUser(null); setLoading(false); return; }
    try {
      const res = await http.get("/auth/me");
      setUser(res.data?.data?.user || null);
    } catch {
      setUser(null);
      localStorage.removeItem("vtm_token");
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMe(); /* eslint-disable-next-line */ }, [token]);

  const login = async (email: string, password: string) => {
    const res = await http.post("/auth/login", { email, password });
    const t = res.data?.data?.token;
    if (!t) throw new Error("Token missing");
    localStorage.setItem("vtm_token", t);
    setToken(t);
  };

  const logout = () => {
    localStorage.removeItem("vtm_token");
    setToken(null);
    setUser(null);
  };

  const hasPermission = (...permissionCodes: string[]) => {
    if (!permissionCodes.length) return true;
    const granted = user?.permissions || [];
    return permissionCodes.some((permissionCode) => granted.includes(permissionCode));
  };

  const value = useMemo(
    () => ({ user, token, login, logout, hasPermission, loading }),
    [user, token, loading]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
