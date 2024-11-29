import React, { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthService } from "../services/AuthService";
import { pageRoutes, Routes } from "../../../utils/pageRoutes";

interface ProtectedRouteProps {
  redirectPath?: string;
  roles?: string[];
  children?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  redirectPath = "/login",
  children,
  roles,
}) => {
  const location = useLocation();
  const token = AuthService.getToken();
  const userRoles = AuthService.getRolesFromToken();
  const currentRole = userRoles?.[0] || "";

  // Allow access to home page and login page without authentication
  if (
    location.pathname === "/" ||
    location.pathname === "/user-information" ||
    location.pathname === redirectPath
  ) {
    return children ? <>{children}</> : <Outlet />;
  }

  // Redirect to login if not authenticated for any other route
  if (!token) {
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }

  // Role-based access restrictions for ROLE_ADMIN
  if (currentRole === "ROLE_ADMIN") {
    // Define restricted routes for ROLE_ADMIN
    const restrictedRoutes = [
      "/admin/patient-management",
      "/admin/drug-management",
      "/admin/doctor-management",
    ];

    // Redirect to /admin/not-permitted if accessing restricted routes
    if (restrictedRoutes.some((route) => location.pathname.startsWith(route))) {
      return <Navigate to="/admin/not-permitted" replace />;
    }
  }

  // Role-based access control for other roles
  const getCurrentRoute = (path: string): Routes | undefined => {
    const normalizedPath = path.split("/")[1];
    return pageRoutes.find((route) => route.path === `/${normalizedPath}`);
  };

  const currentRoute = getCurrentRoute(location.pathname);

  // If route requires specific roles
  if (currentRoute?.roles) {
    const requiredRoles = currentRoute?.roles || roles || [];
    const hasRequiredRole = requiredRoles.some((role) =>
      role.split(", ").includes(currentRole)
    );

    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};
