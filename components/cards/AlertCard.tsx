import { AdminAlert } from "@/types/global";
import { AlertTriangle, Badge, ChevronRight, DollarSign, Package, ShoppingCart, TrendingDown } from "lucide-react";

const getAlertConfig = (alert: AdminAlert) => {
  const configs = {
    REVENUE_DROP: {
      icon: TrendingDown,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
    ORDERS_DROP: {
      icon: ShoppingCart,
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    AOV_DROP: {
      icon: DollarSign,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    WORST_PRODUCTS: {
      icon: Package,
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    CATEGORY_PERFORMANCE: {
      icon: AlertTriangle,
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  };

  return configs[alert.type] || configs.REVENUE_DROP;
};

const getSeverityBadge = (severity: AdminAlert["severity"]) => {
  const severityConfig = {
    critical: {
      label: "Critical",
      className: "bg-red-100 text-red-700 border-red-300",
    },
    warning: {
      label: "Warning",
      className: "bg-orange-100 text-orange-700 border-orange-300",
    },
    info: {
      label: "Info",
      className: "bg-blue-100 text-blue-700 border-blue-300",
    },
  };

  const config = severityConfig[severity];

  return (
    <Badge className={`${config.className} border font-semibold`}>
      {config.label}
    </Badge>
  );
};

const AlertCard = ({ alert }: { alert: AdminAlert }) => {
  const config = getAlertConfig(alert);
  const Icon = config.icon;

  return (
    <div
      className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4 hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start gap-3">
        <div className={`${config.iconBg} p-2 rounded-lg shrink-0`}>
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-semibold text-gray-900">{alert.title}</h4>
            {getSeverityBadge(alert.severity)}
          </div>

          <p className="text-sm text-gray-700 mb-3">{alert.description}</p>

          {alert.meta && (
            <div className="mt-3 space-y-2">
              {alert.meta.current !== undefined &&
                alert.meta.previous !== undefined && (
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Current: </span>
                      <span className="font-semibold text-gray-900">
                        ${alert.meta.current.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Previous: </span>
                      <span className="font-semibold text-gray-900">
                        ${alert.meta.previous.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

              {alert.meta.products && (
                <button className="h-8 text-xs font-medium p-0 hover:bg-transparent hover:underline">
                  View {alert.meta.products.length} affected products
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertCard;