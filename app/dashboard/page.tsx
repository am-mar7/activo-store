import TryAgain from "@/components/TryAgain";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import {
  getAnalyticsCharts,
  getKPIs,
  getTopProducts,
  getWorstProducts,
} from "@/lib/server actions/analytics.action";
import { Suspense } from "react";
import Loading from "../loading";
import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { DateRangeSelector } from "@/components/buttons/DataRangeSelector";
import KPICard from "@/components/cards/KPICard";
import { RouteParams } from "@/types/global";
import DataChart from "@/components/DataChart";
import TopProductsList from "@/components/dashboard/lists/TopProductsList";
import WorstProductsList from "@/components/dashboard/lists/WorstProductsList";

type PageProps = {
  from?: string;
  to?: string;
  preset?: "day" | "week" | "month";
};

export default async function Overview({ searchParams }: RouteParams) {
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
