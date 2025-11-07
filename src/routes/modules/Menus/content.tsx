import Blank from "@/pages/Blank";
import FileManagement from "@/pages/Menus/File/FileManagement";
import InstructorManagement from "@/pages/Menus/Instructor/InstructorManagement";
import LocationManagement from "@/pages/Menus/Location/LocationManagement";
import TestimonyManagement from "@/pages/Menus/Testimony/TestimonyManagement";
import { AppRoute } from "@/types/route";

export const contentRoutes: AppRoute[] = [
  {
    path: "/content/files",
    element: <FileManagement />,
    meta: {
      title: "File Management",
      description: "Content file management page",
      requiresAuth: true,
      breadcrumb: ["Menus", "File", "Files"],
    },
  },
  {
    path: "/content/instructors",
    element: <InstructorManagement />,
    meta: {
      title: "Instructor Management",
      description: "Content instructor management page",
      requiresAuth: true,
      breadcrumb: ["Menus", "Content", "Instructors"],
    },
  },
  {
    path: "/content/locations",
    element: <LocationManagement />,
    meta: {
      title: "Location Management",
      description: "Content location management page",
      requiresAuth: true,
      breadcrumb: ["Menus", "Content", "Locations"],
    },
  },
  {
    path: "/content/testimonies",
    element: <TestimonyManagement />,
    meta: {
      title: "Testimony Management",
      description: "Content testimony management page",
      requiresAuth: true,
      breadcrumb: ["Menus", "Content", "Testimonies"],
    },
  },
];
