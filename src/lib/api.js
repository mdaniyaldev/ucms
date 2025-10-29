import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// We'll allow AuthContext to register a handler for 401s:
let onUnauthorized = null;
export function setOnUnauthorized(handler) {
  onUnauthorized = handler;
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    if (status === 401 && typeof onUnauthorized === "function") {
      try { await onUnauthorized(); } catch {}
    }
    return Promise.reject(error);
  }
);

export default api;