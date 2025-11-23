import WorkshopManagement from "@/pages/Menus/Workshop/WorkshopManagement";
import WorkshopRegistrationManagement from "@/pages/Menus/WorkshopRegistration/WorkshopRegistrationManagement";
import { AppRoute } from "@/types/route";

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
    path: "/workshop/registrations",
    element: <WorkshopRegistrationManagement />,
    meta: {
      title: "Workshop Registration",
      description: "Workshop registration page",
      requiresAuth: true,
      breadcrumb: ["Menus", "Workshop", "Registration"],
    },
  },
];
