import axios from "axios";

const apiBaseUrl = (
  import.meta.env.VITE_API_URL || "/api"
).replace(/\/+$/, "");

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10_000,
});
