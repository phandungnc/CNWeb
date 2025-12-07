import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

const ProtectRoutes = ({ children, allowedRoles }) => {
  const { isAuthenticated, userProfile, loading } = useUser();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) return <Navigate to="/login" />;

  // Check access permissions
  if (allowedRoles && userProfile?.roles) {
    const hasPermission = allowedRoles.some((role) =>
      userProfile.roles.some(
        (userRole) => role.toLowerCase() === userRole.toLowerCase()
      )
    );

    if (!hasPermission) {
      // User doesn't have permission → redirect to default route based on role
      let redirectPath = "/";

      // Get the first role to determine redirect path
      const primaryRole = userProfile.roles[0]?.toLowerCase();

      switch (primaryRole) {
        case "admin":
          redirectPath = "/admin";
          break;
        case "teacher":
          redirectPath = "/teacher";
          break;
        case "student":
          redirectPath = "/home";
          break;
        default:
          redirectPath = "/login";
      }

      return <Navigate to={redirectPath} />;
    }
  }

  return children;
};

export default ProtectRoutes;