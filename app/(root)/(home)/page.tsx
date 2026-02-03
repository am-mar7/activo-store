import Loading from "@/app/loading";
import ProductCard from "@/components/cards/ProductCard";
import TryAgain from "@/components/TryAgain";
import ROUTES from "@/constants/routes";
import { getCategories } from "@/lib/server actions/category.action";
import { getBestSellers } from "@/lib/server actions/product.action";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Footer from "@/components/Footer";
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Activo Store - | Home',
  description: 'Discover Activo Store\'s collection of premium activewear and lifestyle clothing. Shop best-selling athletic wear, casual styles, and trending fashion. Free shipping on orders over $50.',
  keywords: 'activewear, athletic clothing, lifestyle apparel, gym wear, sports clothing, casual wear, Activo Store',
  openGraph: {
    title: 'Activo Store - Premium Active & Lifestyle Clothing',
    description: 'Shop premium activewear and lifestyle clothing at Activo Store. Discover our best-selling collections.',
    url: 'https://activostore.com',
    siteName: 'Activo Store',
    images: [
      {
        url: 'https://activostore.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Activo Store - Premium Activewear',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Activo Store - Premium Active & Lifestyle Clothing',
    description: 'Shop premium activewear and lifestyle clothing at Activo Store.',
    images: ['https://activostore.com/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://activostore.com',
  },
}

export default function Home() {
  return (
    <div className="relative w-full h-125 md:h-150 lg:h-175">
      <section className="flex-center flex-col ">
        <div className="max-w-7xl py-5 w-full">
          <h1 className="h2-bold text-center mb-5">Our Categories</h1>
          <Suspense fallback={<Loading />}>
            <Categories />
          </Suspense>
        </div>
      </section>

      <section className="my-5 sm:my-10 px-5 sm:px-10 overflow-hidden">
        <h1 className="h2-bold mb-5">Best sellers</h1>
        <Suspense fallback={<Loading />}>
          <BestSellers />
        </Suspense>
      </section>
      <Footer/>
    </div>
  );
}

async function Categories() {
  const { success, data } = await getCategories({ pageSize: 8 });
  if (!success || !data)
    return <TryAgain message="Failed to load the categories" />;

  const categories = data.categories;
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-2xl:px-5">
        {categories.map((category) => (
          <Link
            href={ROUTES.CATEGORY(category.slug)}
            key={category._id}
            className="relative group overflow-hidden rounded-lg aspect-3/4 block"
          >
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />

            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h2 className="text-white body-bold sm:base-bold font-semibold flex items-center gap-2">
                {category.name}
                <span className="text-white group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </h2>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

async function BestSellers() {
  const { success, data: products } = await getBestSellers();
  if (!success || !products)
    return <TryAgain message="Failed to load the categories" />;

  return (
    <div className="relative">
      <Carousel
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {products.map((product, index) => (
            <CarouselItem
              key={index}
              className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
            >
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
