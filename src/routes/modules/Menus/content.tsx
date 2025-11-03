import Blank from "@/pages/Blank";
import { AppRoute } from "@/types/route";
import FileManagement from "@/pages/Menus/File/FileManagement";

export const contentRoutes: AppRoute[] = [
  {
    path: "/content/faq",
    element: <Blank />,
    meta: {
      title: "FAQ Management",
      description: "Content FAQ management page",
      requiresAuth: true,
      breadcrumb: ["Menus", "Content", "FAQ"],
    },
  },
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
    element: <Blank />,
    meta: {
      title: "Instructor Management",
      description: "Content instructor management page",
      requiresAuth: true,
      breadcrumb: ["Menus", "Content", "Instructors"],
    },
  },
  {
    path: "/content/locations",
    element: <Blank />,
    meta: {
      title: "Location Management",
      description: "Content location management page",
      requiresAuth: true,
      breadcrumb: ["Menus", "Content", "Locations"],
    },
  },
  {
    path: "/content/testimonies",
    element: <Blank />,
    meta: {
      title: "Testimony Management",
      description: "Content testimony management page",
      requiresAuth: true,
      breadcrumb: ["Menus", "Content", "Testimonies"],
    },
  },
];