import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  previous: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
}

export default function KPICard({
  title,
  value,
  change,
  previous,
  subtitle,
  icon,
  iconBg = "bg-gray-100",
  iconColor = "text-gray-600",
}: KPICardProps) {
  const isPositive = change >= 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`${iconBg} ${iconColor} p-2 rounded-lg`}>{icon}</div>
      </div>

      <div className="space-y-2">
        <p className="text-3xl font-bold text-gray-900">{value}</p>

        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? (
              <ArrowUpIcon className="w-4 h-4" />
            ) : (
              <ArrowDownIcon className="w-4 h-4" />
            )}
            <span>{Math.abs(change).toFixed(1)}%</span>
          </div>
          <span className="text-sm text-gray-500">vs {previous}</span>
        </div>

        {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
      </div>
    </div>
  );
}
