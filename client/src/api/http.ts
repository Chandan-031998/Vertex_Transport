import axios from "axios";

const isDev = Boolean((import.meta as any).env?.DEV);

// If you set VITE_API_BASE_URL, it will use that.
// Otherwise, in production it will use the current site origin (Vercel/custom domain).
const raw = String((import.meta as any).env?.VITE_API_BASE_URL || "").trim().replace(/\/$/, "");

const origin =
  raw ||
  (isDev ? "http://localhost:4000" : window.location.origin);

// Always talk to /api
const baseURL = origin.endsWith("/api") ? origin : `${origin}/api`;

export const http = axios.create({
  baseURL,
  withCredentials: false
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("vtm_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});