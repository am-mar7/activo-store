"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib/urls";

interface Props {
  isNext?: boolean;
  page?: string | number;
  pageSize?: number;
  total?: number;
}

export default function Pagination({
  isNext = false,
  page = 1,
  pageSize = 15,
  total = 0,
}: Props) {
  page = Number(page);
  const router = useRouter();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(total / pageSize);

  const handlePageChange = (newPage: number) => {
    const value = newPage > 1 ? newPage.toString() : "";
    let newUrl = "";
    if (value.length) {
      newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "page",
        value,
      });
    } else {
      newUrl = removeKeysFromUrlQuery({
        params: searchParams.toString(),
        keysToRemove: ["page"],
      });
    }
    router.push(newUrl);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 3;

    pages.push(1);

    if (page > maxVisible) {
      pages.push("...");
    }

    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    ) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    if (page < totalPages - maxVisible + 1) {
      pages.push("...");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const startResult = (page - 1) * pageSize + 1;
  const endResult = Math.min(page * pageSize, total);

  return (
    <div className="w-full flex items-center justify-center lg:justify-between px-6 py-4 bg-white dark:bg-dark-200 rounded-lg border border-gray-200 dark:border-dark-400">
      <div className="text-sm text-gray-600 hidden lg:block">
        Viewing {startResult}-{endResult} of {total} results
      </div>

      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <Button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-md hover:bg-gray-100 dark:hover:bg-dark-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {/* Page Numbers */}
        {renderPageNumbers().map((pageNum, index) => {
          if (pageNum === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-gray-600 dark:text-light-400"
              >
                ...
              </span>
            );
          }
          if (Number(page) === Number(pageNum)) {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-gray-100 bg-blue-600"
              >
                {pageNum}
              </span>
            );
          }
          return (
            <Button
              key={pageNum}
              onClick={() => handlePageChange(pageNum as number)}
              variant={page === pageNum ? "default" : "ghost"}
              className={`h-10 w-10 rounded-md ${
                page === pageNum
                  ? "bg-primary-500 text-white hover:bg-primary-600"
                  : "hover:bg-gray-100 dark:hover:bg-dark-300 text-gray-700 dark:text-light-400"
              }`}
            >
              {pageNum}
            </Button>
          );
        })}

        {/* Next Button */}
        <Button
          onClick={() => handlePageChange(page + 1)}
          disabled={!isNext || page >= totalPages}
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-md hover:bg-gray-100 dark:hover:bg-dark-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
