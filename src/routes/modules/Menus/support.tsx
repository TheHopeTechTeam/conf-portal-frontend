import FaqManagement from "@/pages/Menus/Faq/FaqManagement";
import FeedbackManagement from "@/pages/Menus/Feedback/FeedbackManagement";
import { AppRoute } from "@/types/route";

export const supportRoutes: AppRoute[] = [
  {
    path: "/support/faq",
    element: <FaqManagement />,
    meta: {
      title: "FAQ Management",
      description: "Support FAQ management page",
      requiresAuth: true,
      breadcrumb: ["Menus", "Support", "FAQ"],
    },
  },
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
