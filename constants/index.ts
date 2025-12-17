import {
  LayoutDashboard,
  Users,
  Package,
  FolderTree,
  ShoppingBag,
  Tags,
  Star,
} from "lucide-react";
import { DASHBOARDROUTES } from "./routes";

export const DashboardLinks = [
  {
    icon: LayoutDashboard,
    route: DASHBOARDROUTES.HOME,
    label: "Overview",
  },
  {
    icon: ShoppingBag,
    route: DASHBOARDROUTES.ORDERS,
    label: "Orders",
  },
  {
    icon: Package,
    route: DASHBOARDROUTES.PRODUCTS,
    label: "Products",
  },
  {
    icon: FolderTree,
    route: DASHBOARDROUTES.CATEGORY,
    label: "Categories",
  },
  {
    icon: Users,
    route: DASHBOARDROUTES.USERS,
    label: "Users",
  },
  {
    icon: Tags,
    route: DASHBOARDROUTES.PROMOCODES,
    label: "promocodes",
  },
  {
    icon: Star,
    route: DASHBOARDROUTES.REVIEWS,
    label: "reviews",
  },
];
