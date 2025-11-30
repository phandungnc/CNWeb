import axios from "axios";
import axiosInstance from "./axiosInstance";

const handleLogin = async (credentials) => {
  console.log("check user: ", credentials);
  const response = await axiosInstance.post("/api/auth/login", credentials);
  return response.data;
};

const handleRegister = async (data) => {
  console.log("check data", data);
  const response = await axiosInstance.post("/api/auth/register", data);
  return response.data;
};

const refreshToken = async () => {
  const response = await axiosInstance.post("/api/auth/refresh-token");
  return response.data;
};

const logout = async () => {
  const response = await axiosInstance.post("/api/auth/logout");
  return response.data;
};

export { handleLogin, handleRegister, refreshToken, logout };