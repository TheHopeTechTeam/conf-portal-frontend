import ConferenceManagement from "@/pages/Menus/Conference/ConferenceManagement";
import EventScheduleManagement from "@/pages/Menus/EventSchedule/EventScheduleManagement";
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
    element: <EventScheduleManagement />,
    meta: {
      title: "Event Schedule Management",
      description: "Event schedule management page",
      requiresAuth: true,
      breadcrumb: ["Menus", "Conference", "Event Schedule"],
    },
  },
];
