"use client";
import { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";

interface Props {
  images: string[];
}

export default function ProductImageCarousel({ images }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="w-full">
      {/* Main Image Display */}
      <div className="mb-6">
        <div className="relative aspect-square h-70 sm:h-80 2xl:h-150 bg-black rounded-lg overflow-hidden">
          <Image
            quality={90}
            width={400}
            height={400}
            src={images[selectedIndex]}
            alt={`Product view ${selectedIndex + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Thumbnail Carousel */}
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {images.map((image, index) => (
            <CarouselItem
              key={index}
              className="pl-2 md:pl-4 basis-1/4 2xs:basis-1/5 xs:basis-1/6 sm:basis-1/8 md:basis-1/5 xl:basis-1/6"
            >
              <button
                onClick={() => setSelectedIndex(index)}
                className={`relative aspect-square w-16 md:w-full rounded-lg overflow-hidden border-2 transition-all ${
                  selectedIndex === index
                    ? "border-primary-700 shadow-lg"
                    : "border-white0"
                }`}
              >
                <Image
                  width={200}
                  height={200}
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {selectedIndex === index && (
                  <div className="absolute inset-0 bg-white/10" />
                )}
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
