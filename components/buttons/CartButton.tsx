"use client";
import ROUTES from "@/constants/routes";
import { useCartStore } from "@/stores/useCartStore";
import Link from "next/link";
import { LiaOpencart } from "react-icons/lia";
import { useEffect, useState } from "react";

interface Props {
  isHome?: boolean;
  className?: string;
}

export default function CartButton({ isHome = false, className = "" }: Props) {
  const itemsCount = useCartStore((state) => state.getItemCount());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <Link
      href={ROUTES.CART}
      className={`flex-center mr-3 sm:mr-4 relative ${className}`}
    >
      <LiaOpencart
        className={`w-7 h-7 ${isHome ? "text-slate-100" : "text-slate-900"}`}
      />
      {/* Render badge only after mount to avoid hydration mismatch */}
      {mounted && itemsCount > 0 && (
        <span className="absolute -top-1 -right-1 text-xs w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center">
          {itemsCount}
        </span>
      )}
    </Link>
  );
}
