import TryAgain from "@/components/TryAgain";
import UserAvatar from "@/components/UserAvatar";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { getOrders } from "@/lib/server actions/order.action";
import { getUserById } from "@/lib/server actions/user.action";
import { RouteParams } from "@/types/global";
import React from "react";
import { AddressesList } from "@/components/dashboard/lists/AddressesList";
import { Badge } from "@/components/ui/badge";
import { MapPin, Mail, Shield } from "lucide-react";
import { OrdersList } from "@/components/dashboard/lists/OrdersList";
import Pagination from "@/components/Pagination";

export default async function page({ params, searchParams }: RouteParams) {
  const [{ id }, { page, pageSize, filter, query }] = await Promise.all([
    params,
    searchParams,
  ]);

  const [
    { success: orderSuccess, error: orderError, data: orderData },
    { success: userSuccess, error: userError, data: userData },
  ] = await Promise.all([
    getOrders({
      userId: id,
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 10,
      filter,
      query,
    }),
    getUserById(id),
  ]);

  const tryAgainUser = !userData || userError || !userSuccess;
  const tryAgainOrder = !orderData || orderError || !orderSuccess;

  const { name, email, image, role, addresses } = userData || {};
  const { orders, isNext } = orderData || {};
  return (
    <div className="space-y-6">
      <div>
        <h1 className="h3-semibold text-gray-900">User Details</h1>
        <p className="text-sm text-gray-500 mt-1">
          View and manage user information
        </p>
      </div>

      {tryAgainUser ? (
        <TryAgain message={getFriendlyErrorMessage(userError)} />
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-6">
                <div className="ring-4 ring-white rounded-full">
                  <UserAvatar
                    width={50}
                    height={50}
                    user={{ name, email, image, id }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
                    <Badge
                      variant={role === "admin" ? "destructive" : "default"}
                      className={
                        role === "admin"
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      {role}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">
                        {addresses?.length || 0}{" "}
                        {addresses?.length === 1 ? "Address" : "Addresses"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Addresses
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Manage user delivery addresses
              </p>
            </div>

            {addresses && addresses.length > 0 ? (
              <AddressesList addresses={addresses} />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No addresses found for this user</p>
              </div>
            )}
          </div>

          {!tryAgainOrder && orders && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Order History
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Recent orders placed by this user
                </p>
              </div>
              <OrdersList showCustomer={false} orders={orders} />
              <div className="mt-1.5">
                {orders.length ? (
                  <Pagination page={page} isNext={isNext} />
                ) : null}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
