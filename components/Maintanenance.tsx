import React from "react";
import { Settings } from "lucide-react";

interface MaintenanceProps {
  message?: string;
}

export default function Maintenance({
  message = "We'll be back soon",
}: MaintenanceProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-primary-50 to-primary-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-linear-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                <Settings
                  className="w-12 h-12 text-primary-600 animate-spin"
                  style={{ animationDuration: "3s" }}
                />
              </div>
              <span className="absolute top-0 left-0 w-24 h-24 bg-primary-200 rounded-full animate-ping opacity-75"></span>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Under Maintenance
          </h1>

          <p className="text-lg text-gray-600 mb-8">{message}</p>

          <div className="flex justify-center space-x-2 mb-6">
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>

          <p className="text-sm text-gray-500">
            We&apos;re working hard to improve your experience.
            <br />
            Thank you for your patience.
          </p>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          If you need immediate assistance, please contact support
        </p>
      </div>
    </div>
  );
}
