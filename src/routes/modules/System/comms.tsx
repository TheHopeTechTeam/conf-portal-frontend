import NotificationHistoryManagement from "@/pages/Comms/NotificationHistory/NotificationHistoryManagement";
import NotificationManagement from "@/pages/Comms/Notification/NotificationManagement";
import { AppRoute } from "@/types/route";

export const commsRoutes: AppRoute[] = [
  {
    path: "/comms/notifications",
    element: <NotificationManagement />,
    meta: {
      title: "Notification Management",
      description: "Comms notification management",
      requiresAuth: true,
      breadcrumb: ["Comms", "Notifications"],
    },
  },
  {
    path: "/comms/notification-history",
    element: <NotificationHistoryManagement />,
    meta: {
      title: "Notification History",
      description: "Comms notification history",
      requiresAuth: true,
      breadcrumb: ["Comms", "Notification History"],
    },
  },
];