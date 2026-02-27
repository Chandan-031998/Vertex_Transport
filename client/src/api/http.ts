import axios from "axios";

const rawBase =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  ((import.meta as any).env?.DEV ? "http://localhost:4000" : "");

const base = String(rawBase || "").trim().replace(/\/$/, "");

// If your backend mounts routes under /api:
const baseURL = base ? `${base}/api` : "/api";

export const http = axios.create({
  baseURL,
  withCredentials: false,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("vtm_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});