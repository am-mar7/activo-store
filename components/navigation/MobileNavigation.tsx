"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlignLeft, ChevronRight, ChevronLeft } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import LogoutBtn from "@/components/buttons/LogoutBtn";
import Link from "next/link";
import ROUTES from "@/constants/routes";

interface Category {
    _id: string;
    name: string;
    slug: string;
  }
  
  interface Props {
    categories: Category[];
  }

type SubMenuType = "categories" | "collections" | null;

export default function MobileNavigation({ categories }: Props) {
  const [activeSubmenu, setActiveSubmenu] = useState<SubMenuType>(null);

  const handleBack = () => {
    setActiveSubmenu(null);
  };

  const collections = [
    { name: "winter", slug: "winter" },
    { name: "summer", slug: "summer" },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="secondary"
          className="p-0! bg-transparent border-0 shadow-none sm:hidden"
        >
          <AlignLeft className="w-8 h-8" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="bg-neutral-50 border-none px-0 py-8 sm:hidden w-full"
      >
        <SheetTitle className="hidden">Navigation</SheetTitle>

        <div className="relative h-full overflow-hidden">
          <div
            className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
              activeSubmenu ? "-translate-x-full" : "translate-x-0"
            }`}
          >
            <nav className="px-5 space-y-4 mt-6">
              <SheetClose asChild>
                <Link
                  href={ROUTES.HOME}
                  className="block text-slate-700 hover:text-slate-900 text-lg font-medium transition-colors"
                >
                  shop all
                </Link>
              </SheetClose>

              <button
                onClick={() => setActiveSubmenu("categories")}
                className="w-full flex items-center justify-between text-slate-700 hover:text-slate-900 text-lg font-medium transition-colors"
              >
                <span>shop by category</span>
                <ChevronRight size={20} />
              </button>

              <button
                onClick={() => setActiveSubmenu("collections")}
                className="w-full flex items-center justify-between text-slate-700 hover:text-slate-900 text-lg font-medium transition-colors"
              >
                <span>collections</span>
                <ChevronRight size={20} />
              </button>
            </nav>
          </div>

          {/* Categories Submenu */}
          <div
            className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
              activeSubmenu === "categories"
                ? "translate-x-0"
                : "translate-x-full"
            }`}
          >
            <div className="px-5">
              <button
                onClick={handleBack}
                className="flex items-center text-slate-700 hover:text-slate-900 text-lg font-medium mb-6 transition-colors"
              >
                <ChevronLeft size={20} className="mr-2" />
                shop by category
              </button>
              <nav className="space-y-4">
                {categories?.map((category) => (
                  <SheetClose asChild key={category._id}>
                    <Link
                      href={ROUTES.CATEGORY(category.slug)}
                      className="block text-slate-700 hover:text-slate-900 text-lg transition-colors"
                    >
                      {category.name}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </div>
          </div>

          {/* Collections Submenu */}
          <div
            className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
              activeSubmenu === "collections"
                ? "translate-x-0"
                : "translate-x-full"
            }`}
          >
            <div className="px-5">
              <button
                onClick={handleBack}
                className="flex items-center text-slate-700 hover:text-slate-900 text-lg font-medium mb-6 transition-colors"
              >
                <ChevronLeft size={20} className="mr-2" />
                collections
              </button>
              <nav className="space-y-4">
                {collections.map((collection) => (
                  <SheetClose asChild key={collection.slug}>
                    <Link
                      href={ROUTES.COLLECTION(collection.slug)}
                      className="block text-slate-700 hover:text-slate-900 text-lg transition-colors"
                    >
                      {collection.name}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </div>
          </div>
        </div>

        <SheetFooter className="absolute bottom-8 left-0 right-0 px-5">
          <LogoutBtn isMobile />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}