import TryAgain from "@/components/TryAgain";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { getKPIs } from "@/lib/server actions/analytics.action";
import { Suspense } from "react";
import Loading from "../loading";
import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { DateRangeSelector } from "@/components/buttons/DataRangeSelector";
import KPICard from "@/components/cards/KPICard";
import { RouteParams } from "@/types/global";

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
    <div className="max-w-7xl space-y-3">
      <DateRangeSelector />
      <Suspense fallback={<Loading />}>
        <KPIs to={to} from={from} preset={validPreset} />
      </Suspense>
    </div>
  );
}

async function KPIs({ to, from, preset }: PageProps) {
  const { success, error, data } = await getKPIs({
    from: from,
    to: to,
    preset: preset,
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
