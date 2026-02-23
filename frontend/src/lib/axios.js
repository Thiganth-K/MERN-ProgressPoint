import axios from "axios";
import toast from "react-hot-toast";

// Use the VITE_API_URL in development, or relative path in production
const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001/api"
    : "/api";

const api = axios.create({
  baseURL: BASE_URL,
});

// ─────────────────────────────────────────────
// Request interceptor — attach JWT Bearer token
// ─────────────────────────────────────────────
api.interceptors.request.use(
  config => {
    // Pick the active token for the current role
    const token =
      localStorage.getItem("token") ||      // admin / superadmin
      localStorage.getItem("studentToken") || // student
      localStorage.getItem("guestToken");     // guest

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Keep x-admin-name for logging middleware compatibility
    const adminName = localStorage.getItem("adminName");
    if (adminName) {
      config.headers["x-admin-name"] = adminName;
    }

    return config;
  },
  error => Promise.reject(error)
);

// ─────────────────────────────────────────────
// Response interceptor — handle errors
// ─────────────────────────────────────────────
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const status = error.response.status;

      // Rate limit
      if (status === 429) {
        window.dispatchEvent(new Event("rateLimitExceeded"));
        toast.error("Too many requests! Please wait a moment.", {
          style: {
            background: "#fff",
            color: "#1d4ed8",
            border: "1px solid #f59e42"
          },
          iconTheme: {
            primary: "#f59e42",
            secondary: "#fff",
          },
        });
      }

      // Token expired or invalid → clear storage and redirect to login
      if (status === 401) {
        const isExpired = error.response.data?.expired;
        const currentPath = window.location.pathname;

        // Avoid redirect loops on login pages
        if (
          !currentPath.includes("login") &&
          !currentPath.includes("home") &&
          currentPath !== "/"
        ) {
          // Clear all auth tokens
          localStorage.removeItem("token");
          localStorage.removeItem("studentToken");
          localStorage.removeItem("guestToken");
          localStorage.removeItem("adminName");
          localStorage.removeItem("role");
          localStorage.removeItem("studentRegNo");

          if (isExpired) {
            toast.error("Your session has expired. Please log in again.");
          }

          // Redirect based on which portal was in use
          if (currentPath.includes("student")) {
            window.location.href = "/student-login";
          } else {
            window.location.href = "/admin-login";
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;