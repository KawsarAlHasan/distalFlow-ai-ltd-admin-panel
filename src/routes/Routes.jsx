import { createBrowserRouter } from "react-router-dom";

import Login from "../pages/authentication/Login";
import ForgotPassword from "../pages/authentication/ForgotPassword";
import CheckCode from "../pages/authentication/CheckCode";
import SetNewPassword from "../pages/authentication/SetNewPassword";
import Unauthorized from "../components/Unauthorized";

import { AdminProvider } from "../context/AdminContext";
import MainLayout from "../layout/MainLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import DashboardOrRedirect from "./DashboardOrRedirect";
import Clinics from "../pages/clinics/Clinics";
import Leads from "../pages/leads/Leads";
import Billing from "../pages/billing/Billing";
import Exclusivity from "../pages/exclusivity/Exclusivity";
import Settings from "../pages/settings/Settings";
import NotFound from "../components/NotFound";
import Plans from "../pages/plans/Plans";
import TermsManagement from "../pages/legal/TermsManagement";
import PrivacyManagement from "../pages/legal/PrivacyManagement";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/forget-password",
    element: <ForgotPassword />,
  },
  {
    path: "/check-code",
    element: <CheckCode />,
  },
  {
    path: "/set-new-password",
    element: <SetNewPassword />,
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
  {
    path: "/",
    element: (
      <AdminProvider>
        <MainLayout />
      </AdminProvider>
    ),
    children: [
      {
        path: "/",
        element: <Dashboard />,
      },
      {
        path: "/clinics",
        element: <Clinics />,
      },
      {
        path: "/leads",
        element: <Leads />,
      },
      {
        path: "/billing",
        element: <Billing />,
      },
      {
        path: "/plans",
        element: <Plans />,
      },
      {
        path: "/exclusivity",
        element: <Exclusivity />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
      {
        path: "/terms-management",
        element: <TermsManagement />,
      },
      {
        path: "/privacy-management",
        element: <PrivacyManagement />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
