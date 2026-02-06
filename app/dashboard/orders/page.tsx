import Loading from "@/app/loading";
import { OrdersList } from "@/components/dashboard/lists/OrdersList";
import Pagination from "@/components/Pagination";
import LocalSearch from "@/components/searchbars/LocalSearch";
import { DASHBOARDROUTES } from "@/constants/routes";
import { getAllOrders } from "@/lib/server actions/order.action";
import { RouteParams } from "@/types/global";
import { Suspense } from "react";

export default function Orders({ searchParams, params }: RouteParams) {
  return (
    <Suspense fallback={<Loading />}>
      <OrdersContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function OrdersContent({ searchParams }: RouteParams) {
  const { page, filter, pageSize, query } = await searchParams;
  const { success, error, data } = await getAllOrders({
    page: Number(page) || 1,
    filter: String(filter),
    pageSize: Number(pageSize) || 25,
    query,
  });
  const tryAgain = !success || error;
  const { isNext, items: orders, total } = data || {};
  return (
    <div className="max-w-7xl w-full overflow-x-auto">
      <div className="flex-1">
        <LocalSearch
          route={DASHBOARDROUTES.ORDERS}
          placeholder="search for orders by customer name , email or phone..."
        />
      </div>
      {!tryAgain && orders && (
        <div className="bg-white">
          <h3 className="h3-semibold text-slate-800  mt-4 mb-1.5 px-1">
            Orders
          </h3>
          <OrdersList showCustomer={true} orders={orders} />

          <div className="mt-1.5">
            {orders.length ? (
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
