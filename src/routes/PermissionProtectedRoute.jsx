import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import Loading from "../components/Loading";
import Unauthorized from "../components/Unauthorized";
import { usePermission } from "../hooks/usePermission";

const PermissionProtectedRoute = ({ 
  children, 
  requiredModule, 
  requiredAction = "view"
}) => {
  const { adminProfile, isLoading } = useAdmin();
  const { hasPermission, getFirstAccessiblePage, canAccessModule } = usePermission();
  const location = useLocation();

  // Show loading while checking
  if (isLoading) {
    return <Loading />;
  }

  // If no admin profile, redirect to login
  if (!adminProfile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Special handling for dashboard - redirect to first accessible page if no access
  if (requiredModule === "dashboard" && !canAccessModule("dashboard")) {
    const firstAccessiblePage = getFirstAccessiblePage();
    if (firstAccessiblePage && firstAccessiblePage.path !== "/") {
      return <Navigate to={firstAccessiblePage.path} replace />;
    }
  }

  // Check if user has required permission
  const userHasPermission = hasPermission(requiredModule, requiredAction);

  // If user doesn't have permission, show unauthorized
  if (!userHasPermission) {
    // For dashboard, if user doesn't have access, we already redirected above
    if (requiredModule === "dashboard") {
      // If we reach here, it means user has no access to any page
      return <Unauthorized message="You don't have permission to access any page." />;
    }
    
    // For other pages, show unauthorized
    return <Unauthorized />;
  }

  // User has permission, render the component
  return children;
};

export default PermissionProtectedRoute;