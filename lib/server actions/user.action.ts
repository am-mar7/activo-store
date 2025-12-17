"use server";

import { signOut } from "@/auth";
import ROUTES from "@/constants/routes";

export async function Logout() {
  await signOut({ redirectTo: ROUTES.HOME });
}
