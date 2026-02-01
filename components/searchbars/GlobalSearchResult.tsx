"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { Loader2, Search as SearchIcon, ChevronRight } from "lucide-react";
import { SearchProductResult } from "@/types/global";
import { GlobalSearch } from "@/lib/server actions/product.action";
import ROUTES from "@/constants/routes";

interface Props {
  onClose: () => void;
}

export default function GlobalSearchResult({ onClose }: Props) {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchProductResult[]>([]);
  const query = searchParams.get("q");

  useEffect(() => {
    const getResults = async () => {
      if (!query) {
        setResults([]);
        return;
      }

      setLoading(true);
      const { success, data } = await GlobalSearch(query);

      if (success && data) {
        setResults(data);
      } else {
        setResults([]);
      }
      setLoading(false);
    };

    getResults();
  }, [query]);

  if (!query) return null;

  return (
    <div className="mt-4 w-full animate-in fade-in slide-in-from-top-2 absolute top-full z-10 lg:ml-2 min-w-60 max-w-150 rounded-xl border border-light-700 bg-light-900 shadow-xl duration-200">
      <div className="rounded-xl border border-neutral-200 bg-white shadow-lg">
        {!loading && results.length > 0 && (
          <div className="px-4 py-3 border-b border-neutral-200">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              {results.length} {results.length === 1 ? "Product" : "Products"}{" "}
              Found
            </p>
          </div>
        )}

        <div className="max-h-125 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              <p className="mt-4 text-sm text-slate-600">
                Searching for products...
              </p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              {results.map((product) => (
                <Link
                  onClick={onClose}
                  href={ROUTES.PRODUCT(product._id)}
                  key={product._id.toString()}
                  className="group flex items-center gap-4 rounded-lg p-3 transition-all hover:bg-neutral-50"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                    <Image
                      src={product.images[0] || "/placeholder.png"}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
                      {product.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      {product.categoryDetails && product.categoryDetails && (
                        <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                          {product.categoryDetails.name}
                        </span>
                      )}
                      <span className="text-sm font-semibold text-slate-900">
                        ${product.newPrice.toFixed(2)}
                      </span>
                      {product.oldPrice && (
                        <span className="text-xs text-slate-500 line-through">
                          ${product.oldPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                <SearchIcon className="h-8 w-8 text-slate-400" />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-900">
                No products found
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Try a different search term
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
