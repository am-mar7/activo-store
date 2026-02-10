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
    title: `Activo Store | ${product.title}`,
    description: `${description} Shop ${product.title} at Activo Store. LE ${product.newPrice}. Free shipping on orders over LE 500.`,
    keywords: `${product.title}, activewear, buy ${product.title}, athletic clothing`,
    openGraph: {
      title: `Activo Store | ${product.title}`,
      description: product.description,
      url: `https://activo-store.vercel.app.com/products/${id}`,
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
      canonical: `https://activo-store.vercel.app.com/products/${id}`,
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

  return (
    <div className="flex-center flex-col">
      <div className="max-w-7xl w-full flex flex-col md:flex-row px-5 my-4">
        <div className="w-full md:w-1/2">
          <ProductImageCarousel images={images} />
        </div>
        <div className="w-full mt-6 md:mt-0 md:w-1/2 md:px-15 overflow-y-auto no-scrollbar max-h-180">
          <p className="text-lg md:text-xl flex gap-3">
            {oldPrice && <span className="line-through">LE {oldPrice}</span>}
            <span>LE {formatPrice(newPrice, "EGP")}</span>
          </p>
          <h1 className="h3-semibold text-slate-900">{title}</h1>
          <p className="text-slate-600 body-medium">{description}</p>
          {guide && <SizeGuide className="my-3" image={guide} />}
          <AddToCartForm
            variants={variants}
            _id={id}
            images={images}
            newPrice={newPrice}
            title={title}
          />
        </div>
      </div>
      <Suspense fallback={<Loading />}>
        <CategoriedProducts categories={category} id={id} />
      </Suspense>
    </div>
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
    <div className="flex-center flex-col w-full">
      <div className="relative my-5 w-full max-w-7xl px-5">
        <h1 className="h3-semibold text-slate-800 my-2">You may also like</h1>
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
                    <ProductCard product={product} />
                  </CarouselItem>
                )
            )}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
}
