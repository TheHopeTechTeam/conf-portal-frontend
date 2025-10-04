import { MdDashboard } from "react-icons/md";
import Dashboard from "../../pages/Dashboard";
import { ModuleRoute } from "../../types/route";

export const dashboardRoutes: ModuleRoute = {
  module: "dashboard",
  meta: {
    title: "Dashboard",
    description: "Main dashboard page",
    icon: <MdDashboard />,
    order: 1,
  },
  routes: [
    {
      path: "/",
      element: <Dashboard />,
      meta: {
        title: "Dashboard",
        description: "Main dashboard page",
        requiresAuth: true,
        breadcrumb: ["Dashboard"],
      },
    },
  ],
};
