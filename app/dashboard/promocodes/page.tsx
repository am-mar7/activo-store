import { PromoCodesList } from "@/components/dashboard/lists/PromoCodesList";
import DataRenderer from "@/components/DataRenderer";
import Pagination from "@/components/Pagination";
import LocalSearch from "@/components/searchbars/LocalSearch";
import { DASHBOARDROUTES } from "@/constants/routes";
import { getPromoCodes } from "@/lib/server actions/promocode.action";
import { RouteParams } from "@/types/global";
import { Plus } from "lucide-react";
import Link from "next/link";
export default async function PromoCode({ searchParams }: RouteParams) {
  const { page, pageSize, filter, query } = await searchParams;
  const { success, error, data } = await getPromoCodes({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    filter,
    query,
  });
  const {items: promos , total , isNext} = data || {};
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
      <DataRenderer
        data={promos}
        success={success}
        render={(promos) => (
          <>
            <h2 className="h3-semibold mt-6 py-1">Promo codes</h2>
            <div className="min-w-250 w-full mb-4">
              {promos && <PromoCodesList promoCodes={promos} />}
            </div>
            <Pagination isNext={isNext} total={total} />
          </>
        )}
        empty={{
          title: "No Orders Found",
          message: "There are no Orders yet. Hold On the traffic is comming.",
        }}
        error={error}
      />
    </div>
  );
}
