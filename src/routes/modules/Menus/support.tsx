import Blank from "@/pages/Blank";
import { AppRoute } from "@/types/route";

export const supportRoutes: AppRoute[] = [
  {
    path: "/support/feedback",
    element: <Blank />,
    meta: {
      title: "Support Feedback",
      description: "Support feedback page",
      requiresAuth: true,
      breadcrumb: ["Menus", "Support", "Feedback"],
    },
  },
];