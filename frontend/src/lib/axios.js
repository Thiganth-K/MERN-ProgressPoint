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

// Add a request interceptor to include admin name in headers
api.interceptors.request.use(
  config => {
    const adminName = localStorage.getItem('adminName');
    if (adminName) {
      config.headers['x-admin-name'] = adminName;
    }
    
    // Add super admin authentication for protected routes
    const role = localStorage.getItem('role');
    const superAdminAuth = sessionStorage.getItem('superAdminAuth');
    
    if (role === 'superadmin' && superAdminAuth) {
      config.headers['Authorization'] = `Basic ${superAdminAuth}`;
    }
    
    return config;
  },
  error => Promise.reject(error)
);

// Add a response interceptor for rate limiting
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 429) {
      // Dispatch custom event to show rate limit modal
      window.dispatchEvent(new Event('rateLimitExceeded'));
      
      // Also show toast as backup
      toast.error(
        "Too many requests! Please wait a moment.",
        {
          style: {
            background: "#fff",
            color: "#1d4ed8",
            border: "1px solid #f59e42"
          },
          iconTheme: {
            primary: "#f59e42",
            secondary: "#fff",
          },
        }
      );
    }
    return Promise.reject(error);
  }
);

export default api;