import axios from "axios";

const rawBase = import.meta.env.VITE_API_BASE;

if (!rawBase) {
  // Fail fast so you don't ship a build that points to localhost or wrong URL
  throw new Error("VITE_API_BASE is missing. Set it in client/.env and rebuild.");
}

const baseURL = rawBase.replace(/\/$/, ""); // remove trailing slash

export const http = axios.create({ baseURL });

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("vtm_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});