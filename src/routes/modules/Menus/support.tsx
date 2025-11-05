import FeedbackManagement from "@/pages/Menus/Feedback/FeedbackManagement";
import { AppRoute } from "@/types/route";

export const supportRoutes: AppRoute[] = [
  {
    path: "/support/feedback",
    element: <FeedbackManagement />,
    meta: {
      title: "Support Feedback",
      description: "Support feedback page",
      requiresAuth: true,
      breadcrumb: ["Menus", "Support", "Feedback"],
    },
  },
];
