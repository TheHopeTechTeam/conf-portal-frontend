import { ModuleRoute } from "@/types/route";
import { MdSettings } from "react-icons/md";
import { commsRoutes } from "./comms";
import { systemRoutes } from "./system";

export const systemMenuRoutes: ModuleRoute = {
  module: "system",
  meta: {
    title: "System Management",
    description: "System management and administration",
    icon: <MdSettings />,
    order: 2,
  },
  routes: [...systemRoutes, ...commsRoutes],
};
