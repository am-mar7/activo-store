import LocalSearch from "@/components/searchbars/LocalSearch";
import { DASHBOARDROUTES } from "@/constants/routes";
import {  Plus } from "lucide-react";
import Link from "next/link";
export default function PromoCode() {
  return (
    <div className="max-w-7xl">
      <div className="flex flex-col xs:flex-row gap-2 items-center">
        <div className="flex-1 max-xs:w-full">
          <LocalSearch
            route={DASHBOARDROUTES.PROMOCODES}
            placeholder="search for promo Codes..."
          />
        </div>
        <Link
          href={DASHBOARDROUTES.ADDPROMOCODE}
          className="h-14 max-xs:w-full flex gap-1 bg-primary-gradient text-neutral-50 p-3.5 rounded-lg"
        >
          <Plus />
          Add Promo Code
        </Link>
      </div>
    </div>
  );
}
