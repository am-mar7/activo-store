import Loading from "@/app/loading";
import NotFound from "@/app/not-found";
import SizeGuide from "@/components/buttons/SizeGuide";
import ProductCard from "@/components/cards/ProductCard";
import AddToCartForm from "@/components/forms/AddToCartForm";
import ProductImageCarousel from "@/components/ProductCarousal";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

import {
  getProduct,
  getProductsByCategoryId,
} from "@/lib/server actions/product.action";
import { formatPrice } from "@/lib/utils";
import { RouteParams } from "@/types/global";
import { Suspense } from "react";
import type { Metadata } from "next";
import * as motion from "motion/react-client";

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { id } = await params;
  const { data: product } = await getProduct(id);

  if (!product) {
    return {
      title: "Activo Store | Product Not Found",
    };
  }

  const description =
    product.description.length > 155
      ? `${product.description.substring(0, 155)}...`
      : product.description;

  return {
    title: `${product.title} - Premium Activewear | Activo Store`,
    description: `${description} Shop ${product.title} at Activo Store. LE ${product.newPrice}. Free shipping on orders over LE 500.`,
    keywords: `${product.title}, activewear, buy ${product.title}, athletic clothing`,
    openGraph: {
      title: `Activo Store | ${product.title}`,
      description: product.description,
      url: `https://activostore.com/products/${id}`,
      siteName: "Activo Store",
      images: [
        {
          url: product.images[0],
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Activo Store | ${product.title}`,
      description: product.description,
      images: [product.images[0]],
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://activostore.com/products/${id}`,
    },
  };
}

export default function ProductDetails({ params, searchParams }: RouteParams) {
  return (
    <Suspense fallback={<Loading />}>
      <ProductDetailsContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function ProductDetailsContent({ params }: RouteParams) {
  const { id } = await params;
  const { success, data: product } = await getProduct(id);
  if (!success || !product) return NotFound();

  const {
    title,
    description,
    images,
    oldPrice,
    newPrice,
    variants,
    category,
    sizeGuide: guide,
  } = product;

  const productJSONLD = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    image: images,
    description,
    sku: id,
    brand: { "@type": "Brand", name: "Activo Store" },
    offers: {
      "@type": "Offer",
      url: `https://activostore.com/products/${id}`,
      priceCurrency: "EGP",
      price: newPrice,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <motion.div
      className="flex-center flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJSONLD) }}
      />
      <div className="max-w-7xl w-full flex flex-col md:flex-row px-5 my-4 gap-6">
        <motion.div
          className="w-full md:w-1/2"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        >
          <ProductImageCarousel images={images} />
        </motion.div>

        <motion.div
          className="w-full md:w-1/2 md:pl-8 flex flex-col"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 0.6,
            delay: 0.2,
            type: "spring",
            stiffness: 100,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <p className="text-lg md:text-xl flex gap-3">
              {oldPrice && (
                <span className="line-through text-gray-500">
                  LE {oldPrice}
                </span>
              )}
              <span className="font-semibold">
                LE {formatPrice(newPrice, "EGP")}
              </span>
            </p>
            <h1 className="h3-semibold text-slate-900">{title}</h1>
          </motion.div>

          <motion.p
            className="text-slate-600 body-medium whitespace-pre-line md:max-h-50 lg:max-h-60 2xl:max-h-70 overflow-y-auto custom-scrollbar"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            {description}
          </motion.p>

          {guide && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <SizeGuide className="my-3" image={guide} />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <AddToCartForm
              variants={variants}
              _id={id}
              images={images}
              newPrice={newPrice}
              title={title}
            />
          </motion.div>
        </motion.div>
      </div>

      <Suspense fallback={<Loading />}>
        <CategoriedProducts categories={category} id={id} />
      </Suspense>
    </motion.div>
  );
}

async function CategoriedProducts({
  categories,
  id,
}: {
  categories: string[];
  id: string;
}) {
  const results = await Promise.all(
    categories.map((id) => getProductsByCategoryId({ id }))
  );

  let allProducts = results
    .filter((result) => result.success && result.data && !result.error)
    .flatMap((result) => result?.data?.products);

  if (allProducts.length === 0) return null;
  allProducts = allProducts.filter((p) => p?._id !== id);

  return (
    <motion.div
      className="flex-center flex-col w-full"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
    >
      <div className="relative my-5 w-full max-w-7xl px-5">
        <motion.h1
          className="h3-semibold text-slate-800 my-2"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          You may also like
        </motion.h1>

        <Carousel
          className="w-full"
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent className="-ml-2 md:-ml-4 max-w-7xl">
            {allProducts.map(
              (product, index) =>
                product && (
                  <CarouselItem
                    key={index}
                    className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{
                        duration: 0.5,
                        delay: (index % 5) * 0.1,
                        type: "spring",
                        stiffness: 100,
                      }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  </CarouselItem>
                )
            )}
          </CarouselContent>
        </Carousel>
      </div>
    </motion.div>
  );
}
