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
    <div>
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
          <div className="space-y-2">
            {orders?.map((order, index) => (
              <OrderCard index={index} key={order._id} order={order} />
            ))}
          </div>
        )}
      />
    </div>
  );
}
