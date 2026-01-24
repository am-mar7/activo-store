import { cn } from "@/lib/utils";
import { Lock, Construction, AlertCircle } from "lucide-react";

interface NotImplementedProps {
  feature?: string;
  variant?: "lock" | "construction" | "alert";
  size?: "sm" | "md" | "lg";
  message?: string;
  className?: string;
}

export function NotImplemented({
  feature = "This feature",
  variant = "lock",
  size = "md",
  message,
  className,
}: NotImplementedProps) {
  const icons = {
    lock: Lock,
    construction: Construction,
    alert: AlertCircle,
  };

  const sizes = {
    sm: {
      container: "p-4",
      icon: "w-8 h-8",
      title: "text-sm",
      message: "text-xs",
    },
    md: {
      container: "p-6",
      icon: "w-12 h-12",
      title: "text-base",
      message: "text-sm",
    },
    lg: {
      container: "p-8",
      icon: "w-16 h-16",
      title: "text-lg",
      message: "text-base",
    },
  };

  const Icon = icons[variant];
  const sizeClasses = sizes[size];

  return (
    <div
      className={cn(
        className,
        `${sizeClasses.container} bg-linear-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center`
      )}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gray-400/20 blur-xl rounded-full" />
        <Icon
          className={`${sizeClasses.icon} text-gray-400 relative animate-pulse`}
          strokeWidth={1.5}
        />
      </div>
      <h3 className={`${sizeClasses.title} font-semibold text-gray-700 mt-4`}>
        {feature} is not implemented yet
      </h3>
      {message && (
        <p className={`${sizeClasses.message} text-gray-500 mt-2 max-w-xs`}>
          {message}
        </p>
      )}
      <div className="flex gap-1 mt-3">
        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce [animation-delay:0ms]" />
        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce [animation-delay:150ms]" />
        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}
