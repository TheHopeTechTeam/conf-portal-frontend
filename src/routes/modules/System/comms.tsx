import Blank from "@/pages/Blank";
import { AppRoute } from "@/types/route";

export const commsRoutes: AppRoute[] = [
  {
    path: "/comms/notifications",
    element: <Blank />,
    meta: {
      title: "Notification Management",
      description: "Comms notification management",
      requiresAuth: true,
      breadcrumb: ["Comms", "Notifications"],
    },
  },
  {
    path: "/comms/notification-history",
    element: <Blank />,
    meta: {
      title: "Notification History",
      description: "Comms notification history",
      requiresAuth: true,
      breadcrumb: ["Comms", "Notification History"],
    },
  },
];