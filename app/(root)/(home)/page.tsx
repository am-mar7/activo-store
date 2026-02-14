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
import type { Metadata } from "next";
import * as motion from "motion/react-client";

export const metadata: Metadata = {
  title: "Activo Store - | Home",
  description:
    "Discover Activo Store's collection of premium activewear and lifestyle clothing. Shop best-selling athletic wear, casual styles, and trending fashion. Free shipping on orders over $50.",
  keywords:
    "activewear, athletic clothing, lifestyle apparel, gym wear, sports clothing, casual wear, Activo Store",
  openGraph: {
    title: "Activo Store - Premium Active & Lifestyle Clothing",
    description:
      "Shop premium activewear and lifestyle clothing at Activo Store. Discover our best-selling collections.",
    url: "https://activostore.com",
    siteName: "Activo Store",
    images: [
      {
        url: "https://activostore.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Activo Store - Premium Activewear",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Activo Store - Premium Active & Lifestyle Clothing",
    description:
      "Shop premium activewear and lifestyle clothing at Activo Store.",
    images: ["https://activostore.com/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://activostore.com",
  },
};

export default function Home() {
  return (
    <motion.div 
      className="relative w-full min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.section 
        className="my-5 sm:my-10 px-5 sm:px-10 overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="h2-bold mb-5">Categories</h1>
        <Suspense fallback={<Loading />}>
          <Categories />
        </Suspense>
      </motion.section>

      <motion.section 
        className="my-5 sm:my-10 px-5 sm:px-10 overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="h2-bold mb-5">Best sellers</h1>
        <Suspense fallback={<Loading />}>
          <BestSellers />
        </Suspense>
      </motion.section>
      <Footer />
    </motion.div>
  );
}

async function Categories() {
  const { success, data } = await getCategories({ pageSize: 8 });
  if (!success || !data)
    return <TryAgain message="Failed to load the categories" />;

  const categories = data.categories;

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
        {categories.map((category, index) => (
          <motion.div 
            key={category._id}
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.6,
              delay: (index % 6) * 0.1, // Stagger in groups of 6
              type: "spring",
              stiffness: 100,
            }}
            whileHover={{ y: -8 }}
          >
            <Link
              href={ROUTES.CATEGORY(category.slug)}
              className="relative group overflow-hidden rounded-xl aspect-3/4 block shadow-lg hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, (max-width: 1536px) 20vw, 16vw"
                className="object-cover transition-all duration-700 ease-out group-hover:scale-125 group-hover:rotate-2 brightness-100 group-hover:brightness-110"
              />

              {/* Multi-layer gradient overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 group-hover:via-black/40 transition-all duration-500" />
              
              {/* Animated border glow */}
              <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/50 rounded-xl transition-all duration-500" />

              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/20 to-transparent" />

              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 transform group-hover:translate-y-0 transition-transform duration-300">
                <h2 className="text-white text-sm sm:text-base font-bold leading-tight flex items-center gap-1.5 sm:gap-2 drop-shadow-lg">
                  <span className="line-clamp-2">{category.name}</span>
                  <span
                    className="text-white opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 text-xl shrink-0"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </h2>
                <p className="text-white/80 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                  Shop now
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

async function BestSellers() {
  const { success, data: products } = await getBestSellers();
  if (!success || !products)
    return <TryAgain message="Failed to load the products" />;

  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
    >
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
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
                whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.6,
                  delay: (index % 6) * 0.08, // Stagger in groups of 6
                  type: "spring",
                  stiffness: 100,
                }}
              >
                <ProductCard product={product} />
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </motion.div>
  );
}