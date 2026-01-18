import { OrderCard } from "@/components/cards/OrderCard";
import DataRenderer from "@/components/DataRenderer";
import ROUTES from "@/constants/routes";
import { getOrders } from "@/lib/server actions/order.action";
import { RouteParams } from "@/types/global";

export default async function Profile({ searchParams }: RouteParams) {
  const { filter, page, pageSize } = await searchParams;
  const { success, data, error } = await getOrders({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    filter: String(filter),
  });
  const { orders } = data || { isNext: false, orders: [] };

  return (
    <div className="mb-5 bg-linear-to-br from-neutral-100 to-neutral-200 py-8 px-4 sm:px-6 lg:px-8">
      <DataRenderer
        success={success}
        error={error}
        data={orders}
        empty={{
          title: "No orders yet",
          message: "go place your first order",
          button: { text: "Browse cart", href: ROUTES.CART },
        }}
        render={(orders) => (
          <div className="space-y-2 py-8 px-4 sm:px-6 lg:px-8 mb-5 bg-linear-to-br from-neutral-100 to-neutral-200">
            <div>
              <h1 className="h2-bold text-neutral-900">My Orders</h1>
              <p className="body-medium text-neutral-700 mb-3">
                Manage your track your orders
              </p>
            </div>
            {orders?.map((order, index) => (
              <OrderCard index={index} key={order._id} order={order} />
            ))}
          </div>
        )}
      />
    </div>
  );
}
