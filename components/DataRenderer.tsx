import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { AlertCircle, PackageOpen } from "lucide-react";
import { getFriendlyErrorMessage } from "@/lib/error-messages";

interface Props<T> {
  success: boolean;
  data?: T[] | undefined | null;
  error?: {
    message: string;
    details?: Record<string, string[]>;
  };
  render: (data: T[] | undefined | null) => React.ReactNode;
  empty: {
    title: string;
    message: string;
    button?: {
      text: string;
      href: string;
    };
  };
}

interface StateSkeletonProps {
  icon: React.ReactNode;
  title: string;
  message: string;
  button?: {
    text: string;
    href: string;
  };
  error?: boolean;
}

function StateSkeleton({
  icon,
  title,
  message,
  button,
  error = false,
}: StateSkeletonProps) {
  return (
    <div className="mt-16 w-full flex-center flex-col">
      <div
        className={`mb-8  ${
          error ? "text-destructive" : "text-muted-foreground"
        }`}
      >
        {icon}
      </div>
      <h2 className="h2-semibold text-slate-900 text-center">{title}</h2>
      {title !== message && (
        <p className="body-regular text-slate-500 mt- 1.5 my-3 max-w-md text-center">
          {error ? getFriendlyErrorMessage(message) : message}
        </p>
      )}

      {button && (
        <Button
          asChild
          className="bg-primary-600 text-neutral-50 hover:bg-primary-gradient"
        >
          <Link href={button?.href}>{button.text}</Link>
        </Button>
      )}
    </div>
  );
}

export default function DataRenderer<T>({
  success,
  data,
  error,
  render,
  empty,
}: Props<T>) {
  if (!success) {
    return (
      <StateSkeleton
        icon={<AlertCircle className="w-32 h-32 stroke-[1.5]" />}
        title={getFriendlyErrorMessage(error?.message) || "Error"}
        message={
          getFriendlyErrorMessage(JSON.stringify(error?.details)) ||
          "Something went wrong"
        }
        error={true}
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <StateSkeleton
        icon={<PackageOpen className="w-32 h-32 stroke-[1.5]" />}
        title={empty.title || "Ops..."}
        message={empty.message}
        button={empty.button}
      />
    );
  }

  return <>{render(data)}</>;
}
