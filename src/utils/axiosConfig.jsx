import axios from "axios";
import { message } from "antd";

let notified = false;

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch(Promise.reject);
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        const res = await axios.post(
          "http://localhost:8080/api/auth/refresh",
          { refreshToken }
        );

        if (!res.data?.success) throw new Error("Refresh failed");

        const { accessToken, refreshToken: newRefreshToken } = res.data.data;

        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        axiosInstance.defaults.headers.common.Authorization =
          `Bearer ${accessToken}`;

        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err, null);

        if (!notified) {
          notified = true;
          message.warning(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
            3
          );
        }

        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        delete axiosInstance.defaults.headers.common.Authorization;

        setTimeout(() => {
          notified = false;        // reset
          isRefreshing = false;
          failedQueue = [];
          window.location.href = "/login";
        }, 800);

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
