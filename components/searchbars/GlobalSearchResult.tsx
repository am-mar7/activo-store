"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import * as motion from "motion/react-client";

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
    <motion.div 
      className="mt-4 w-full absolute top-full z-10 lg:ml-2 min-w-60 max-w-150"
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <div className="rounded-xl border border-neutral-200 bg-white shadow-lg">
        {!loading && results.length > 0 && (
          <motion.div 
            className="px-4 py-3 border-b border-neutral-200"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              {results.length} {results.length === 1 ? "Product" : "Products"}{" "}
              Found
            </p>
          </motion.div>
        )}

        <div className="max-h-125 overflow-y-auto custom-scrollbar">
          {loading ? (
            <motion.div 
              className="flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              <p className="mt-4 text-sm text-slate-600">
                Searching for products...
              </p>
            </motion.div>
          ) : results.length > 0 ? (
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {results.map((product, index) => (
                <motion.div
                  key={product._id.toString()}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                  }}
                >
                  <Link
                    onClick={onClose}
                    href={ROUTES.PRODUCT(product._id)}
                    className="group flex items-center gap-4 rounded-lg p-3 transition-all hover:bg-neutral-50 hover:shadow-md"
                  >
                    <motion.div 
                      className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-neutral-100"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Image
                        src={product.images[0] || "/placeholder.png"}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
                        {product.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                        {product.categoryDetails && (
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

                    <motion.div 
                      className="shrink-0"
                      initial={{ opacity: 0, x: -5 }}
                      whileHover={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="flex flex-col items-center justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
              >
                <SearchIcon className="h-8 w-8 text-slate-400" />
              </motion.div>
              <motion.p 
                className="mt-4 text-sm font-medium text-slate-900"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                No products found
              </motion.p>
              <motion.p 
                className="mt-1 text-xs text-slate-600"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                Try a different search term
              </motion.p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}