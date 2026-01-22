import { OrdersList } from "@/components/dashboard/lists/OrdersList";
import DataRenderer from "@/components/DataRenderer";
import Pagination from "@/components/Pagination";

import { getAllOrders } from "@/lib/server actions/order.action";
import { RouteParams } from "@/types/global";

export default async function Orders({ searchParams }: RouteParams) {
  const { page, filter, pageSize } = await searchParams;
  const { success, error, data } = await getAllOrders({
    page: Number(page) || 1,
    filter: String(filter),
    pageSize: Number(pageSize) || 25,
  });

  const { isNext, items: orders, total } = data || {};
  return (
    <div className="max-w-7xl w-full overflow-x-auto">
      <DataRenderer
        data={orders}
        success={success}
        render={(orders) => (
          <>
            <h2 className="h3-semibold mt-6 py-1">Orders</h2>
            <div className="min-w-250 w-full mb-4">
              {orders && <OrdersList orders={orders} />}
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
