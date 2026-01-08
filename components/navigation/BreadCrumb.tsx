"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { Fragment } from "react";

interface BreadcrumbsProps {
  customLabels?: Record<string, string>;
  showHomeIcon?: boolean;
  separator?: React.ReactNode;
  className?: string;
  capitalize?: boolean;
  nonClickableSegments?: string[];
}

export function Breadcrumbs({
  customLabels = {},
  showHomeIcon = true,
  separator,
  className = "",
  capitalize = true,
  nonClickableSegments = ["product", "category", "collection"],
}: BreadcrumbsProps) {
  const pathname = usePathname();

  if (pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbs = segments.map((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join("/")}`;

    let label = customLabels[path] || segment;

    label = label.replace(/[-_]/g, " ");

    if (capitalize && !customLabels[path]) {
      label = label
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    return {
      label,
      path,
      isLast: index === segments.length - 1,
    };
  });

  const defaultSeparator = <ChevronRight className="w-4 h-4 text-gray-400" />;

  return (
    <nav aria-label="Breadcrumb" className={`py-3 ${className}`}>
      <ol className="flex items-center gap-2 text-sm sm:text-md flex-wrap">
        <li>
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 transition-colors flex items-center"
          >
            {showHomeIcon ? <Home className="w-4 h-4" /> : "Home"}
          </Link>
        </li>

        {breadcrumbs.map((crumb, index) => (
          <Fragment key={crumb.path || index}>
            <li className="flex items-center">
              {separator || defaultSeparator}
            </li>
            <li>
              {crumb.isLast ||
              nonClickableSegments.includes(crumb.label.toLowerCase()) ? (
                <span className="text-gray-900 font-medium">{crumb.label}</span>
              ) : (
                <Link
                  href={crumb.path}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}

export function BreadcrumbsCompact({
  customLabels = {},
  className = "",
}: Omit<BreadcrumbsProps, "showHomeIcon" | "separator">) {
  const pathname = usePathname();

  if (pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join("/")}`;
    const label = customLabels[path] || segment.replace(/[-_]/g, " ");

    return {
      label,
      path,
      isLast: index === segments.length - 1,
    };
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className={`text-sm text-gray-600 ${className}`}
    >
      <Link href="/" className="hover:text-gray-900">
        Home
      </Link>
      {breadcrumbs.map((crumb) => (
        <span key={crumb.path}>
          {" / "}
          {crumb.isLast ? (
            <span className="text-gray-900">{crumb.label}</span>
          ) : (
            <Link href={crumb.path} className="hover:text-gray-900">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
