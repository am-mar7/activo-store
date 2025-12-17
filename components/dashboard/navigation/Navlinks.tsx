"use client";
import { SheetClose } from "@/components/ui/sheet";
import { DashboardLinks } from "@/constants";
import { DASHBOARDROUTES } from "@/constants/routes";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  isMobile?: boolean;
  userId?: string | null;
}
export default function NavLinks({ isMobile = false }: Props) {
  const pathName = usePathname();

  return (
    <>
      {DashboardLinks.map(({ route, icon: Icon, label }) => {
        const isActive =
          pathName === route ||
          (pathName.includes(route) &&
            route.length > 1 &&
            route !== DASHBOARDROUTES.HOME);
        const linkComponent = (
          <Link
            className={`${
              isMobile ? "flex-start" : "flex-center xl:flex-start"
            } gap-3 ${
              isActive && "bg-primary-gradient text-neutral-50"
            } rounded-lg p-3`}
            href={route}
            prefetch={false}
          >
            <Icon className="w-5 h-5" />
            <p
              className={`${isMobile ? "" : "max-xl:hidden"} ${
                isActive ? "text-light-900" : "text-dark200_light800"
              }`}
            >
              {label}
            </p>
          </Link>
        );
        return isMobile ? (
          <SheetClose asChild key={label} className="w-full">
            {linkComponent}
          </SheetClose>
        ) : (
          <div className="w-full" key={label}>
            {linkComponent}
          </div>
        );
      })}
    </>
  );
}
