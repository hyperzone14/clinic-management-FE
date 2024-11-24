// import React from "react";
// import { Navigate, Outlet } from "react-router-dom";
// import { AuthService } from "../services/AuthService";

// interface ProtectedRouteProps {
//   allowedRoles?: string[];
//   requireAuth?: boolean;
//   redirectPath?: string;
// }

// export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
//   allowedRoles = [],
//   requireAuth = false,
//   redirectPath = "/login",
// }) => {
//   const token = AuthService.getToken();
//   const userRoles = AuthService.getRolesFromToken();

//   // If authentication is not required, allow access
//   if (!requireAuth) {
//     return <Outlet />;
//   }

//   // If authentication is required but no token exists
//   if (requireAuth && !token) {
//     return <Navigate to={redirectPath} replace />;
//   }

//   // If specific roles are required, check for them
//   const hasRequiredRole =
//     allowedRoles.length === 0 ||
//     (userRoles && allowedRoles.some((role) => userRoles.includes(role)));

//   if (requireAuth && !hasRequiredRole) {
//     return <Navigate to="/unauthorized" replace />;
//   }

//   return <Outlet />;
// };

import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthService } from "../services/AuthService";
import { pageRoutes, Routes } from "../../../utils/pageRoutes";

interface ProtectedRouteProps {
  redirectPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  redirectPath = "/login",
}) => {
  const location = useLocation();
  const token = AuthService.getToken();
  const userRoles = AuthService.getRolesFromToken();
  const currentRole = userRoles?.[0] || "";

  // Allow access to home page and login page without authentication
  if (location.pathname === "/" || location.pathname === redirectPath) {
    return <Outlet />;
  }

  // Redirect to login if not authenticated for any other route
  if (!token) {
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }

  // User is authenticated - check role-based access
  const getCurrentRoute = (path: string): Routes | undefined => {
    const normalizedPath = path.split("/")[1];
    return pageRoutes.find((route) => route.path === `/${normalizedPath}`);
  };

  const currentRoute = getCurrentRoute(location.pathname);

  // If route requires specific roles
  if (currentRoute?.roles) {
    const hasRequiredRole = currentRoute.roles.some((role) =>
      role.split(", ").includes(currentRole)
    );

    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};
