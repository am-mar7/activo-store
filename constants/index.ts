import {
  LayoutDashboard,
  Users,
  Package,
  FolderTree,
  ShoppingBag,
  Tags,
  Star,
  Settings,
  Store,
} from "lucide-react";
import ROUTES, { DASHBOARDROUTES } from "./routes";

export const DashboardLinks = [
  {
    icon: LayoutDashboard,
    route: DASHBOARDROUTES.HOME,
    label: "Overview",
  },
  {
    icon: Store,
    route: ROUTES.HOME,
    label: "Store view"
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
  {
    icon: Settings,
    route: DASHBOARDROUTES.SETTINGS,
    label: "Settings",
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
  { value: "mintgreen", label: "Mint Green", hex: "#98FF98" },
  { value: "petrol", label: "Petrol", hex: "#005F73" },
  { value: "burgundy", label: "Burgundy", hex: "#800020" },
  { value: "green", label: "Green", hex: "#22C55E" },
  { value: "havanabrown", label: "Havana Brown", hex: "#6B4423" },
  { value: "beige", label: "Beige", hex: "#F5F5DC" },
  { value: "pink", label: "Pink", hex: "#EC4899" },
  { value: "snowwhite", label: "Snow White", hex: "#FFFAFA" },
  { value: "olivegreen", label: "Olive Green", hex: "#556B2F" },
  { value: "grey", label: "Grey", hex: "#6B7280" },
];
