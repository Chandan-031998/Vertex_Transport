import axios from "axios";

const envBase = String((import.meta as any).env?.VITE_API_BASE_URL || "").trim().replace(/\/$/, "");
const devFallback = "http://localhost:4000";
const origin = envBase || ((import.meta as any).env?.DEV ? devFallback : "");

if (!origin) {
  throw new Error("VITE_API_BASE_URL is required in production");
}

const baseURL = origin.endsWith("/api") ? origin : `${origin}/api`;

export const http = axios.create({
  baseURL,
  withCredentials: false,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("vtm_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
