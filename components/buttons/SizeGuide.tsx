"use client";
import { useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Props {
  image: string;
  className?: string;
}

export default function SizeGuide({ image, className = "" }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "text-slate-900 underline underline-offset-4 hover:text-slate-900 transition-colors body-medium",
          className
        )}
      >
        Size Guide
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-75"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-white w-[90vw] h-[90vh] max-w-6xl max-h-[90vh] flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close size guide"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>

            <div className="flex-1 overflow-auto p-8">
              <Image
                height={1000}
                width={1000}
                quality={100}
                src={image}
                alt="Size Chart"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
