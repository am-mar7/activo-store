import React from "react";
import MobileNavigation from "./MobileNavigation";
import { auth } from "@/auth";

export default async function Navbar() {
  const session = await auth();
  const username = session?.user.name?.trim().split(' ')[0] || "Admin";
  return (
    <nav className="flex-between px-4 py-2 shadow-md sm:hidden">
      <p className="h1-semobold text-slate-900 font-space-grotesk">
        {`Welcome back, ${username}`}
      </p>
      <MobileNavigation />
    </nav>
  );
}
