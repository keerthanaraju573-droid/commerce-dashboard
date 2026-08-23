import axios from "axios";
import { ApiError, getHttpMessage } from "@/lib/errors";

const api = axios.create({
  baseURL: "",
  withCredentials: true,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const nextConfig = { ...config };
    nextConfig.withCredentials = true;
    nextConfig.headers = nextConfig.headers || {};
    nextConfig.headers["X-Requested-With"] = "XMLHttpRequest";
    return nextConfig;
  },
  (error) =>
    Promise.reject(
      new ApiError("The request could not be prepared. Please try again.", 400, error)
    )
);

api.interceptors.response.use(
  (response) => {
    if (response.status === 200 || response.status === 201) {
      return response;
    }
    return response;
  },
  (error) => {
    if (error.name === "ApiError") {
      return Promise.reject(error);
    }

    const status = error.response?.status || (error.code === "ECONNABORTED" ? 500 : 500);
    const apiMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      getHttpMessage(status);
    const details = error.response?.data?.error?.details || null;

    if (status === 401 && typeof window !== "undefined") {
      const path = window.location.pathname;
      if (path !== "/login") {
        window.location.assign("/login");
      }
    }

    return Promise.reject(new ApiError(apiMessage, status, details));
  }
);

export default api;
