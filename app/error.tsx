"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { getFriendlyErrorMessage } from "@/lib/error-messages";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-100 w-full rounded-lg border-slate-200">
      <div className="flex flex-col items-center gap-4 max-w-md text-center p-6">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>

        <div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-slate-600">
            {getFriendlyErrorMessage(error) ||
              "An unexpected error occurred. Please try again."}
          </p>
        </div>

        <button
          onClick={reset}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <RefreshCw className="w-5 h-5" />
          Try Again
        </button>
      </div>
    </div>
  );
}
