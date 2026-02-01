"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib/urls";
import GlobalSearchResult from "./GlobalSearchResult";

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathName = usePathname();

  const query = searchParams.get("q");
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
        setSearch("");
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        onClose();
        setSearch("");
      }
    };

    if (isOpen) {
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 100);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const DebounceFn = setTimeout(() => {
      if (search) {
        const newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "q",
          value: search,
        });

        router.push(newUrl, { scroll: false });
      } else {
        if (query) {
          const newUrl = removeKeysFromUrlQuery({
            params: searchParams.toString(),
            keysToRemove: ["q"],
          });

          router.push(newUrl, { scroll: false });
        }
      }
    }, 300);

    return () => clearTimeout(DebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, query, pathName]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/80 z-50 animate-in fade-in duration-200" />

      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-8 px-4">
        <div
          ref={searchRef}
          className="relative w-full max-w-2xl animate-in slide-in-from-top-2 fade-in duration-200"
        >
          <div className="flex items-center gap-3 px-2 md:px-5 py-1.5 bg-neutral-50 border border-white/20 rounded-lg">
            <Search className="w-5 h-5 text-slate-700 shrink-0" />
            <Input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="flex-1 border-none px-2 bg-transparent text-slate-800 placeholder:text-slate-500 placeholder:small-regular focus-visible:ring-0 focus-visible:ring-offset-0 small-regular h-10 py-0"
            />
            <button
              onClick={() => {
                onClose();
                setSearch("");
              }}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-5 h-5 text-slate-800" />
            </button>
          </div>
          {isOpen && <GlobalSearchResult onClose={onClose} />}
        </div>
      </div>
    </>
  );
}
