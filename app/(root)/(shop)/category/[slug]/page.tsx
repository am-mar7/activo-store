import NotFound from "@/app/not-found";
import ProductCard from "@/components/cards/ProductCard";
import DataRenderer from "@/components/DataRenderer";
import Pagination from "@/components/Pagination";
import { getCategoriedProducts } from "@/lib/server actions/product.action";
import { RouteParams } from "@/types/global";
import type { Metadata } from "next";
import { getCategoryBySlug } from "@/lib/server actions/category.action";
import { Suspense } from "react";
import Loading from "@/app/loading";
import * as motion from "motion/react-client";

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const { data: category } = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Activo Store | Category Not Found",
    };
  }

  return {
    title: `Activo Store | ${category.name}`,
    description: `Shop ${
      category.name
    } at Activo Store. Browse our collection of high-quality ${category.name.toLowerCase()} with free shipping on orders over $50.`,
    keywords: `${
      category.name
    }, ${category.name.toLowerCase()} clothing, activewear, athletic wear`,
    openGraph: {
      title: `Activo Store | ${category.name}`,
      description: `Shop ${category.name} at Activo Store.`,
      url: `https://activo-store.vercel.app.com/categories/${slug}`,
      siteName: "Activo Store",
      images: [
        {
          url: category.image,
          width: 1200,
          height: 630,
          alt: `${category.name} - Activo Store`,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Activo Store | ${category.name}`,
      description: `Shop ${category.name} at Activo Store.`,
      images: [category.image],
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://activo-store.vercel.app.com/categories/${slug}`,
    },
  };
}

export default function CategoriedProducts({
  params,
  searchParams,
}: RouteParams) {
  return (
    <Suspense fallback={<Loading />}>
      <CategoriedProductsContent searchParams={searchParams} params={params} />
    </Suspense>
  );
}

async function CategoriedProductsContent({
  params,
  searchParams,
}: RouteParams) {
  const [{ slug }, { pageSize, page }] = await Promise.all([
    params,
    searchParams,
  ]);

  if (!slug) {
    return NotFound();
  }

  const { success, data, error } = await getCategoriedProducts({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 30,
    slug,
  });
  const { items: products, isNext, total } = data || {};

  return (
    <motion.div
      className="flex-center flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl px-5 w-full py-5">
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 0.6,
            delay: 0.1,
            type: "spring",
            stiffness: 100,
          }}
        >
          <h2 className="h2-semibold">{slug}</h2>
        </motion.div>

        <DataRenderer
          success={success}
          error={error}
          data={products}
          empty={{ title: "No Products Found", message: "" }}
          render={(data) => (
            <>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {data?.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, scale: 0.8, y: 30 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{
                      duration: 0.5,
                      delay: (index % 10) * 0.05, // Stagger within groups of 10
                      type: "spring",
                      stiffness: 100,
                    }}
                    whileHover={{ y: -8, scale: 1.02 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
              <motion.div
                className="my-8"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.5,
                  type: "spring",
                  stiffness: 80,
                }}
              >
                <Pagination
                  isNext={isNext}
                  total={total || 0}
                  pageSize={Number(pageSize) || 30}
                  page={Number(page) || 1}
                />
              </motion.div>
            </>
          )}
        />
      </div>
    </motion.div>
  );
}
