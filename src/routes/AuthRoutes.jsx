import React from "react";
import { Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage/LoginPage";
import RegisterPage from "../pages/RegisterPage/RegisterPage";
import { useUser } from "../contexts/UserContext";

const AuthRoutes = () => {
  const { isAuthenticated } = useUser();

  if (isAuthenticated) {
    // Nếu đã đăng nhập, chuyển hướng tới /home
    return [
      <Route path="*" element={<Navigate to="/home" />} key="home-redirect" />,
    ];
  }

  // Nếu chưa đăng nhập, cho phép truy cập login/register, và redirect root về login
  return [
    <Route path="/" element={<Navigate to="/login" />} key="root-redirect" />,
    <Route path="/login" element={<LoginPage />} key="login" />,
    <Route path="/register" element={<RegisterPage />} key="register" />,
  ];
};

export default AuthRoutes;