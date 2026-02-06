import TryAgain from "@/components/TryAgain";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import {
  getAdminAlerts,
  getAnalyticsCharts,
  getCategoriesPerfromance,
  getKPIs,
  getTopProducts,
  getWorstProducts,
} from "@/lib/server actions/analytics.action";
import { Suspense } from "react";
import Loading from "../loading";
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  CheckCircle2,
  Badge,
  AlertTriangle,
} from "lucide-react";
import { DateRangeSelector } from "@/components/buttons/DataRangeSelector";
import KPICard from "@/components/cards/KPICard";
import { RouteParams } from "@/types/global";
import DataChart from "@/components/DataChart";
import TopProductsList from "@/components/dashboard/lists/TopProductsList";
import WorstProductsList from "@/components/dashboard/lists/WorstProductsList";
import CategoriesPerformanceList from "@/components/dashboard/lists/CategoriesPerformanceList";
import AlertCard from "@/components/cards/AlertCard";

type PageProps = {
  from?: string;
  to?: string;
  preset?: "day" | "week" | "month";
};

export default function Overview({ searchParams, params }: RouteParams) {
  return (
    <Suspense fallback={<Loading />}>
      <OverviewContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function OverviewContent({ searchParams }: RouteParams) {
  const { from, to, preset } = await searchParams;

  const validPreset =
    preset === "day" || preset === "week" || preset === "month"
      ? preset
      : undefined;

  return (
    <div className="flex flex-col-reverse 2xl:flex-row gap-3 2xl:gap-0">
      <div className="flex-1 space-y-3">
        <Suspense fallback={<Loading />}>
          <KPIs to={to} from={from} preset={validPreset} />
        </Suspense>
        <Suspense fallback={<Loading />}>
          <Charts to={to} from={from} preset={validPreset} />
        </Suspense>
        <Suspense fallback={<Loading />}>
          <TopProducts to={to} from={from} preset={validPreset} />
        </Suspense>
        <Suspense fallback={<Loading />}>
          <WorstProducts />
        </Suspense>
        <Suspense fallback={<Loading />}>
          <CategoriesPerformance to={to} from={from} preset={validPreset} />
        </Suspense>

        <Suspense fallback={<Loading />}>
          <AdminAlerts to={to} from={from} preset={validPreset} />
        </Suspense>
      </div>
      <div className="w-full 2xl:max-w-sm relative">
        <div className="2xl:fixed top-4 right-5 2xl:max-w-sm">
          <DateRangeSelector />
        </div>
      </div>
    </div>
  );
}

async function KPIs({ to, from, preset }: PageProps) {
  const { success, error, data } = await getKPIs({
    from,
    to,
    preset,
  });
  console.log("res", success, error, data);

  if (!success || error || !data) {
    return <TryAgain message={getFriendlyErrorMessage(error)} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KPICard
        title="Total Revenue"
        value={`$${data.revenue.total.toLocaleString()}`}
        change={data.revenue.changePercent}
        previous={`$${data.revenue.previous.toLocaleString()}`}
        icon={<DollarSign className="w-5 h-5" />}
        iconBg="bg-green-100"
        iconColor="text-green-600"
      />
      <KPICard
        title="Total Orders"
        value={data.orders.total.toLocaleString()}
        change={data.orders.changePercent}
        previous={data.orders.previous.toLocaleString()}
        icon={<ShoppingCart className="w-5 h-5" />}
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
      />
      <KPICard
        title="New Customers"
        value={data.customers.new.toLocaleString()}
        change={data.customers.changePercent}
        previous={data.customers.previousNew.toLocaleString()}
        subtitle={`Total: ${data.customers.total.toLocaleString()}`}
        icon={<Users className="w-5 h-5" />}
        iconBg="bg-purple-100"
        iconColor="text-purple-600"
      />
      <KPICard
        title="Average Order Value"
        value={`$${data.aov.value.toFixed(2)}`}
        change={data.aov.changePercent}
        previous={`$${data.aov.previous.toFixed(2)}`}
        icon={<TrendingUp className="w-5 h-5" />}
        iconBg="bg-orange-100"
        iconColor="text-orange-600"
      />
    </div>
  );
}

async function Charts({ to, from, preset }: PageProps) {
  const { success, error, data } = await getAnalyticsCharts({
    from,
    to,
    preset,
  });
  console.log("CHARTS RES", success, error, data);

  if (!success || error || !data) {
    return <TryAgain message={getFriendlyErrorMessage(error)} />;
  }

  return (
    <div className="space-y-3">
      <DataChart
        title="Revenue Over Time"
        data={data.revenueOverTime}
        type="area"
        iconName="TrendingUp"
        iconBg="bg-emerald-100"
        iconColor="text-emerald-600"
        chartColor="#34d399"
        valuePrefix="$"
        tooltipColor="text-green-600"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataChart
          title="Orders Over Time"
          data={data.ordersOverTime}
          type="bar"
          iconName="ShoppingCart"
          iconBg="bg-sky-100"
          iconColor="text-sky-600"
          chartColor="#38bdf8"
          valueSuffix=" orders"
          tooltipColor="text-blue-600"
        />
        <DataChart
          title="User Growth"
          data={data.userGrowth}
          type="line"
          iconName="Users"
          iconBg="bg-violet-200"
          iconColor="text-violet-600"
          chartColor="#a78bfa"
          valueSuffix=" users"
          tooltipColor="text-purple-600"
        />
      </div>
    </div>
  );
}

async function TopProducts({ to, from, preset }: PageProps) {
  const { success, error, data } = await getTopProducts({
    from,
    to,
    preset,
  });
  console.log("TOP PRDOCUTS", success, error, data);

  if (!success || error || !data) {
    return <TryAgain message={getFriendlyErrorMessage(error)} />;
  }
  return (
    <TopProductsList
      data={{
        byRevenue: data.byRevenue.map((product) => ({
          ...product,
          image: product.image || "",
        })),
        byQuantity: data.byQuantity.map((product) => ({
          ...product,
          image: product.image || "",
        })),
      }}
    />
  );
}

async function WorstProducts() {
  const { success, error, data } = await getWorstProducts();
  console.log("WOSRT PRDOCUTS", success, error, data);

  if (!success || error || !data) {
    return <TryAgain message={getFriendlyErrorMessage(error)} />;
  }
  return <WorstProductsList data={data} />;
}

async function CategoriesPerformance({ to, from, preset }: PageProps) {
  const { success, error, data } = await getCategoriesPerfromance({
    from,
    to,
    preset,
  });
  console.log("Categories Performance", success, error, data);

  if (!success || error || !data) {
    return <TryAgain message={getFriendlyErrorMessage(error)} />;
  }
  return <CategoriesPerformanceList data={data} />;
}

async function AdminAlerts({ to, from, preset }: PageProps) {
  const { success, error, data } = await getAdminAlerts({
    from,
    to,
    preset,
  });
  console.log("ADMINS ALERTS", success, error, data);

  if (!success || error || !data) {
    return <TryAgain message={getFriendlyErrorMessage(error)} />;
  }
  const criticalAlerts = data.filter((a) => a.severity === "critical");
  const warningAlerts = data.filter((a) => a.severity === "warning");
  const infoAlerts = data.filter((a) => a.severity === "info");

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6 pb-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Admin Alerts</h3>
              <p className="text-sm text-gray-500 mt-1">
                {data.length > 0
                  ? `${data.length} ${
                      data.length === 1 ? "alert" : "alerts"
                    } requiring attention`
                  : "All systems running smoothly"}
              </p>
            </div>
          </div>

          {data.length > 0 && (
            <div className="flex items-center gap-2">
              {criticalAlerts.length > 0 && (
                <Badge className="bg-red-100 text-red-700 border-red-300 border">
                  {criticalAlerts.length} Critical
                </Badge>
              )}
              {warningAlerts.length > 0 && (
                <Badge className="bg-orange-100 text-orange-700 border-orange-300 border">
                  {warningAlerts.length} Warning
                </Badge>
              )}
              {infoAlerts.length > 0 && (
                <Badge className="bg-blue-100 text-blue-700 border-blue-300 border">
                  {infoAlerts.length} Info
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-6 pt-4">
        {data.length === 0 ? (
          <div className="h-75 flex flex-col items-center justify-center text-gray-500">
            <div className="p-4 bg-green-100 rounded-full mb-3">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <p className="font-semibold text-gray-900 text-lg">All Clear!</p>
            <p className="text-sm text-gray-500 mt-1">
              No alerts at this time. Your store is performing well.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {criticalAlerts.map((alert, idx) => (
              <AlertCard key={idx} alert={alert} />
            ))}

            {warningAlerts.map((alert, idx) => (
              <AlertCard key={idx} alert={alert} />
            ))}

            {infoAlerts.map((alert, idx) => (
              <AlertCard key={idx} alert={alert} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
