"use client";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Logout } from "@/lib/server actions/auth.action";
import ROUTES from "@/constants/routes";

interface Props {
  isMobile?: boolean;
  redirection?: string;
  className?: string;
  removeTxtAt?: string;
}

export default function LogoutBtn({
  isMobile = false,
  redirection = ROUTES.HOME,
  className,
  removeTxtAt = "xl",
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleLogOut = async () => {
    setLoading(true);
    await Logout(redirection);
    setLoading(false);
  };
  return (
    <Button
      disabled={loading}
      onClick={handleLogOut}
      className={
        `py-3 w-full btn-secondary h3-semibold hover:bg-red-600! transition-colors hover:text-neutral-50! group delay-75 ${
          loading ? "opacity-40" : ""
        }` + className
      }
    >
      <LogOut />
      <span className={isMobile ? "" : `max-${removeTxtAt}:hidden`}>
        {loading ? "Logging out..." : "Logout"}
      </span>
    </Button>
  );
}
