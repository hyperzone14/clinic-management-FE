import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthService } from "../services/AuthService";

interface ProtectedRouteProps {
  allowedRoles?: string[];
  requireAuth?: boolean;
  redirectPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles = [],
  requireAuth = false,
  redirectPath = "/login",
}) => {
  const token = AuthService.getToken();
  const userRoles = AuthService.getRolesFromToken();

  // If authentication is not required, allow access
  if (!requireAuth) {
    return <Outlet />;
  }

  // If authentication is required but no token exists
  if (requireAuth && !token) {
    return <Navigate to={redirectPath} replace />;
  }

  // If specific roles are required, check for them
  const hasRequiredRole =
    allowedRoles.length === 0 ||
    (userRoles && allowedRoles.some((role) => userRoles.includes(role)));

  if (requireAuth && !hasRequiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
