import { auth } from "@/auth";
import { OrderCard } from "@/components/cards/OrderCard";
import DataRenderer from "@/components/DataRenderer";
import Pagination from "@/components/Pagination";
import ROUTES from "@/constants/routes";
import { getOrders } from "@/lib/server actions/order.action";
import { RouteParams } from "@/types/global";
import { redirect } from "next/navigation";
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Activo Store | Profile',
  description: 'View and manage your orders. Track your order status and review your purchase history at Activo Store.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: 'https://activo-store.vercel.app.com/profile',
  },
}

export default async function Profile({ searchParams }: RouteParams) {
  const [{ filter, page, pageSize }, session] = await Promise.all([
    searchParams,
    auth(),
  ]);

  const userId = session?.user.id;
  if (!userId) return redirect(ROUTES.SIGN_IN);

  const { success, data, error } = await getOrders({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 3,
    filter: String(filter),
    userId,
  });
  const { items: orders, isNext, total } = data || {};

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
            <div className="mt-4">
              <Pagination
                isNext={isNext}
                total={total || 0}
                pageSize={Number(pageSize) || 3}
                page={Number(page) || 1}
              />
            </div>
          </div>
        )}
      />
    </div>
  );
}
