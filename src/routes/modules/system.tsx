import { MdSettings } from "react-icons/md";
import PermissionManagement from "../../pages/System/PermissionManagement";
import ResourceManagement from "../../pages/System/ResourceManagement";
import RoleManagement from "../../pages/System/RoleManagement";
import UserManagement from "../../pages/System/UserManagement";
import { ModuleRoute } from "../../types/route";

export const systemRoutes: ModuleRoute = {
  module: "system",
  meta: {
    title: "System Management",
    description: "System management and administration",
    icon: <MdSettings />,
    order: 6,
  },
  routes: [
    {
      path: "/system/resources",
      element: <ResourceManagement />,
      meta: {
        title: "Resource Management",
        description: "System resource management",
        requiresAuth: true,
        breadcrumb: ["System", "Resources"],
      },
    },
    {
      path: "/system/users",
      element: <UserManagement />,
      meta: {
        title: "User Management",
        description: "System user management",
        requiresAuth: true,
        breadcrumb: ["System", "Users"],
      },
    },
    {
      path: "/system/permissions",
      element: <PermissionManagement />,
      meta: {
        title: "Permission Management",
        description: "System permission management",
        requiresAuth: true,
        breadcrumb: ["System", "Permissions"],
      },
    },
    {
      path: "/system/roles",
      element: <RoleManagement />,
      meta: {
        title: "Role Management",
        description: "System role management",
        requiresAuth: true,
        breadcrumb: ["System", "Roles"],
      },
    },
  ],
};
