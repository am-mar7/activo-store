/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import * as Icons from "lucide-react";
import { useId } from "react";
import { FormattedAnalyticsPoint } from "@/types/global";

type ChartType = "area" | "bar" | "line";

type DataChartProps = {
  title: string;
  data: FormattedAnalyticsPoint[];
  type: ChartType;
  iconName: keyof typeof Icons;
  iconBg: string;
  iconColor: string;
  chartColor: string;
  valuePrefix?: string;
  valueSuffix?: string;
  tooltipColor?: string;
  height?: number;
  emptyMessage?: string;
  loading?: boolean;
};

export default function DataChart({
  title,
  data,
  type,
  iconName,
  iconBg,
  iconColor,
  chartColor,
  valuePrefix = "",
  valueSuffix = "",
  tooltipColor,
  height = 300,
  emptyMessage = "No data available for this period",
  loading = false,
}: DataChartProps) {
  const id = useId();

  const chartData = data.map((point) => ({
    date: new Date(point.date).getTime(),
    label: point.label,
    value: point.value,
  }));

  const Icon = Icons[iconName] ?? Icons.TrendingUp;

  if (loading) {
    return (
      <div className="rounded-xl border bg-white  p-6 space-y-4">
        <div className="h-5 w-40 bg-gray-200  rounded" />
        <div className="h-75 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-6">
        <Header
          title={title}
          Icon={Icon}
          iconBg={iconBg}
          iconColor={iconColor}
        />
        <div
          style={{ height }}
          className="flex items-center justify-center text-sm text-gray-500"
        >
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-neutral shadow-sm">
      <Header title={title} Icon={Icon} iconBg={iconBg} iconColor={iconColor} />

      <div className="px-6 pb-6">
        <ResponsiveContainer width="100%" height={height}>
          {type === "area" && (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Grid />
              <Axes data={data} />
              <Tooltip content={<TooltipContent />} />
              <Area
                dataKey="value"
                stroke={chartColor}
                fill={`url(#${id})`}
                strokeWidth={2}
              />
            </AreaChart>
          )}

          {type === "bar" && (
            <BarChart data={chartData}>
              <Grid />
              <Axes data={data} />
              <Tooltip content={<TooltipContent />} />
              <Bar
                dataKey="value"
                fill={chartColor}
                barSize={18}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          )}

          {type === "line" && (
            <LineChart data={chartData}>
              <Grid />
              <Axes data={data} />
              <Tooltip content={<TooltipContent />} />
              <Line
                dataKey="value"
                stroke={chartColor}
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );

  function TooltipContent({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;

    const point = chartData.find((p) => p.date === label);

    return (
      <div className="rounded-lg border bg-white p-3 shadow">
        <p className="text-xs text-gray-500">{point?.label}</p>
        <p className={`text-lg font-semibold ${tooltipColor}`}>
          {valuePrefix}
          {payload[0].value.toLocaleString()}
          {valueSuffix}
        </p>
      </div>
    );
  }
}

function Header({ title, Icon, iconBg, iconColor }: any) {
  return (
    <div className="flex items-center gap-3 p-6 pb-3">
      <div className={`p-2 rounded-lg ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
    </div>
  );
}

function Grid() {
  return (
    <CartesianGrid
      strokeDasharray="3 3"
      className="stroke-gray-200"
    />
  );
}

function Axes({ data }: { data: FormattedAnalyticsPoint[] }) {
  return (
    <>
      <XAxis
        dataKey="date"
        tickFormatter={(v) => {
          const point = data.find(
            (p) => new Date(p.date).getTime() === new Date(v).getTime()
          );
          return point?.label ?? "";
        }}
        fontSize={12}
        tick={{ fontSize: 12 }}
        interval="preserveStartEnd"
        tickLine={false}
        axisLine={false}
      />
      <YAxis tickLine={false} axisLine={false} />
    </>
  );
}
