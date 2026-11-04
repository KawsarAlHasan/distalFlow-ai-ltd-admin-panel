import { useAdmin } from "../context/AdminContext";

export const usePermission = () => {
  const { adminProfile } = useAdmin();

  const hasPermission = (moduleName, action = "view") => {
    // Super Admin always has all permissions
    if (adminProfile?.role?.name === "Super Admin") {
      return true;
    }

    const permissions = adminProfile?.role?.permissions || [];
    const modulePermission = permissions.find(
      (p) => p.accessibleModule === moduleName
    );

    if (!modulePermission) {
      return false;
    }
    // For other modules, check the specific action
    return modulePermission[action] || false;
  };

  const canAccessModule = (moduleName) => {
    return hasPermission(moduleName, "view");
  };

  const canCreate = (moduleName) => {
    return hasPermission(moduleName, "create");
  };

  const canEdit = (moduleName) => {
    return hasPermission(moduleName, "edit");
  };

  const canDelete = (moduleName) => {
    return hasPermission(moduleName, "delete");
  };

  const canChangeStatus = (moduleName) => {
    return hasPermission(moduleName, "statusChange");
  };

  const canAssignDriver = (moduleName) => {
    return hasPermission(moduleName, "driverAssign");
  };

  const canChangePaidStatus = (moduleName) => {
    return hasPermission(moduleName, "paidStatusChange");
  };

  const canChangeAttendance = (moduleName) => {
    return hasPermission(moduleName, "attendanceChange");
  };

  const canChangeUserCredit = (moduleName) => {
    return hasPermission(moduleName, "userCreditChange");
  };

  const canViewDetails = (moduleName) => {
    return hasPermission(moduleName, "veiwDetails");
  };

  // Get first accessible page for redirection
  const getFirstAccessiblePage = () => {
    const accessiblePages = [
      { module: "dashboard", path: "/" },
      { module: "food-details", path: "/food-details" },
      { module: "food-orders", path: "/food-orders" },
      { module: "food-category", path: "/food-category" },
      { module: "ingredients", path: "/ingredients" },
      { module: "spa-classes", path: "/spa-classes" },
      { module: "spa-booking", path: "/spa-booking" },
      { module: "physio-classes", path: "/physio-classes" },
      { module: "physio-booking", path: "/physio-booking" },
      { module: "classes", path: "/classes" },
      { module: "classes-booking", path: "/classes-booking" },
      { module: "credits", path: "/credits" },
      { module: "credits-buyers", path: "/credits-buyers" },
      { module: "user-management", path: "/user-management" },
      { module: "user-massages", path: "/user-massages" },
      { module: "administrators", path: "/administrators" },
      { module: "drivers", path: "/drivers" },
      { module: "instructors", path: "/instructors" },
      { module: "coupon-code", path: "/coupon-code" },
      { module: "legal-and-banner", path: "/banner" },
    ];

    return accessiblePages.find(page => canAccessModule(page.module));
  };
 
  // Check if user has access to any page
  const hasAnyAccess = () => {
    const modules = [
      "dashboard", "food-details", "food-orders", "food-category", 
      "ingredients", "spa-classes", "spa-booking", "physio-classes",
      "physio-booking", "classes", "classes-booking", "credits",
      "credits-buyers", "user-management", "user-massages", "administrators",
      "drivers", "instructors", "coupon-code", "legal-and-banner"
    ];

    return modules.some(module => canAccessModule(module));
  };

  return {
    hasPermission,
    canAccessModule,
    canCreate,
    canEdit,
    canDelete,
    canChangeStatus,
    canAssignDriver,
    canChangePaidStatus,
    canChangeAttendance,
    canChangeUserCredit,
    canViewDetails,
    getFirstAccessiblePage,
    hasAnyAccess,
    isSuperAdmin: adminProfile?.role?.name === "Super Admin",
  };
};