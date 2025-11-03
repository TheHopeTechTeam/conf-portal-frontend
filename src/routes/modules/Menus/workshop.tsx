import { AppRoute } from "@/types/route";
import WorkshopManagement from "@/pages/Menus/Workshop/WorkshopManagement";
import Blank from "@/pages/Blank";

export const workshopRoutes: AppRoute[] = [
  {
    path: "/workshop/workshops",
    element: <WorkshopManagement />,
    meta: {
      title: "Workshop Management",
      description: "Workshop management page",
      requiresAuth: true,
      breadcrumb: ["Menus", "Workshop", "Workshops"],
    },
  },
  {
    path: "/workshop/registration",
    element: <Blank />,
    meta: {
      title: "Workshop Registration",
      description: "Workshop registration page",
      requiresAuth: true,
      breadcrumb: ["Menus", "Workshop", "Registration"],
    },
  },
];