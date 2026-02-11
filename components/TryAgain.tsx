// components/TryAgain.tsx
"use client";

import { useRouter } from "next/navigation";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useState } from "react";

interface TryAgainProps {
  message?: string;
  onRetry?: () => Promise<void> | void;
}

export default function TryAgain({
  message = "Failed to load data",
  onRetry,
}: TryAgainProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(message);

  const handleRetry = async () => {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      if (onRetry) {
        await onRetry();
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Retry failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-100 w-full rounded-lg border border-slate-200">
      <div className="flex flex-col items-center gap-6 max-w-md text-center p-8">
        {/* Icon with animation */}
        <div className="relative">
          <div className="absolute inset-0 bg-red-200 rounded-full animate-ping opacity-25" />
          <div className="relative w-20 h-20 rounded-full bg-linear-to-br from-red-100 to-red-50 flex items-center justify-center shadow-lg">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
        </div>

        {/* Text content */}
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-slate-900">
            Oops! Something went wrong
          </h3>
          <p className="text-slate-600 text-base leading-relaxed">
            {error || message}
          </p>
        </div>

        {/* Retry button with enhanced states */}
        <button
          onClick={handleRetry}
          disabled={loading}
          className={`
            group relative flex items-center gap-3 px-8 py-3.5 rounded-lg font-semibold 
            transition-all duration-200 shadow-md hover:shadow-lg
            ${
              loading
                ? "bg-slate-400 cursor-not-allowed scale-95"
                : "bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:scale-105 active:scale-95"
            }
          `}
        >
          <RefreshCw
            className={`w-5 h-5 transition-transform ${
              loading ? "animate-spin" : "group-hover:rotate-180 duration-500"
            }`}
          />
          <span>{loading ? "Retrying..." : "Try Again"}</span>
          
          {/* Loading indicator */}
          {loading && (
            <div className="absolute inset-0 bg-white/20 rounded-lg animate-pulse" />
          )}
        </button>

        {/* Helper text */}
        <p className="text-xs text-slate-500 mt-2">
          If the problem persists, please contact support
        </p>
      </div>
    </div>
  );
}