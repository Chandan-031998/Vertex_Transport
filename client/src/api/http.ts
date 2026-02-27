import axios from "axios";

const rawBase = (import.meta.env.VITE_API_BASE || "/api").trim();
const baseURL = rawBase.replace(/\/$/, "");

export const http = axios.create({ baseURL });

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("vtm_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
