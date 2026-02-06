import Loading from "@/app/loading";
import { PromoCodesList } from "@/components/dashboard/lists/PromoCodesList";
import Pagination from "@/components/Pagination";
import LocalSearch from "@/components/searchbars/LocalSearch";
import { DASHBOARDROUTES } from "@/constants/routes";
import { getPromoCodes } from "@/lib/server actions/promocode.action";
import { RouteParams } from "@/types/global";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default function PromoCodes({ searchParams, params }: RouteParams) {
  return (
    <Suspense fallback={<Loading />}>
      <PromoCodesContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function PromoCodesContent({ searchParams }: RouteParams) {
  const { page, pageSize, filter, query } = await searchParams;
  const { success, error, data } = await getPromoCodes({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 25,
    filter,
    query,
  });

  const tryAgain = !success || error;

  const { items: promos, total, isNext } = data || {};
  return (
    <div className="max-w-7xl">
      <div className="flex flex-col-reverse sm:flex-row gap-2 items-center">
        <div className="flex-1 max-sm:w-full">
          <LocalSearch
            route={DASHBOARDROUTES.PROMOCODES}
            placeholder="search for promo Codes..."
          />
        </div>
        <Link
          href={DASHBOARDROUTES.ADDPROMOCODE}
          className="h-14 max-sm:w-full base-medium items-center flex gap-1 bg-primary-gradient text-neutral-50 p-3.5 rounded-lg"
        >
          <Plus />
          Add Promo Code
        </Link>
      </div>
      {!tryAgain && promos && (
        <div className="bg-white">
          <h3 className="h3-semibold text-slate-800 mt-4 mb-1 px-1">
            {" "}
            Promo Codes
          </h3>
          <PromoCodesList promoCodes={promos} />
          <div className="mt-1.5">
            {promos.length ? (
              <Pagination
                pageSize={Number(pageSize) || 25}
                page={page}
                total={total}
                isNext={isNext}
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
