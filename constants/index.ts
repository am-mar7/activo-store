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
    route: DASHBOARDROUTES.CATEGORYS,
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

export const sizes = [
  { value: "m", label: "M" },
  { value: "l", label: "L" },
  { value: "xl", label: "XL" },
  { value: "xxl", label: "XXL" },
  { value: "3xl", label: "3XL" },
  { value: "4xl", label: "4XL" },
];

export const colors = [
  { value: "black", label: "Black", hex: "#000000" },
  { value: "white", label: "White", hex: "#FFFFFF" },
  { value: "navy", label: "Navy", hex: "#001F3F" },
  { value: "blue", label: "Blue", hex: "#3B82F6" },
  { value: "silver", label: "Silver", hex: "#C0C0C0" },
  { value: "babyblue", label: "Baby Blue", hex: "#89CFF0" },
];
