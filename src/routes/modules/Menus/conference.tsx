import Blank from "@/pages/Blank";
import ConferenceManagement from "@/pages/Menus/Conference/ConferenceManagement";
import { AppRoute } from "@/types/route";

export const conferenceRoutes: AppRoute[] = [
  {
    path: "/conference/conferences",
    element: <ConferenceManagement />,
    meta: {
      title: "Conference Management",
      description: "Conference management page",
      requiresAuth: true,
      breadcrumb: ["Menus", "Conference", "Conferences"],
    },
  },
  {
    path: "/conference/events",
    element: <Blank />,
    meta: {
      title: "Conference Events",
      description: "Conference events page",
      requiresAuth: true,
      breadcrumb: ["Menus", "Conference", "Events"],
    },
  },
];
