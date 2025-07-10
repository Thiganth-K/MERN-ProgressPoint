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

// Add a response interceptor for rate limiting
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 429) {
      toast.error(
        "You are sending requests too quickly. Please wait a moment and try again.",
        {
          style: {
            background: "#fff", // base-100
            color: "#1d4ed8", // primary
            border: "1px solid #06b6d4" // accent
          },
          iconTheme: {
            primary: "#f59e42", // accent
            secondary: "#fff",
          },
        }
      );
    }
    return Promise.reject(error);
  }
);

export default api;