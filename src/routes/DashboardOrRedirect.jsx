import React from "react";
import { Navigate } from "react-router-dom";
import Dashboard from "../pages/dashboard/Dashboard";
import { usePermission } from "../hooks/usePermission";
import Loading from "../components/Loading";

const DashboardOrRedirect = () => {
  const { canAccessModule, getFirstAccessiblePage, hasAnyAccess, isLoading } =
    usePermission();

  if (isLoading) {
    return <Loading />;
  }

  // If user has dashboard access, show dashboard
  if (canAccessModule("dashboard")) {
    return <Dashboard />;
  }

  // Otherwise, redirect to first accessible page
  const firstAccessiblePage = getFirstAccessiblePage();
  if (firstAccessiblePage) {
    return <Navigate to={firstAccessiblePage.path} replace />;
  }

  // If no page is accessible, show unauthorized
  return <Navigate to="/unauthorized" replace />;
};

export default DashboardOrRedirect;
