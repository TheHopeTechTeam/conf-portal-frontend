import { ModuleRoute } from "@/types/route";
import { MdMenu } from "react-icons/md";
import { conferenceRoutes } from "./conference";
import { contentRoutes } from "./content";
import { workshopRoutes } from "./workshop";
import { supportRoutes } from "./support";

export const generalMenusRoutes: ModuleRoute = {
  module: "menus",
  meta: {
    title: "Menus",
    description: "Menus pages",
    icon: <MdMenu />,
    order: 1,
  },
  routes: [...conferenceRoutes, ...workshopRoutes, ...contentRoutes, ...supportRoutes],
};
