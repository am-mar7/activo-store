import Loading from "@/app/loading";
import NotFound from "@/app/not-found";
import ProductCard from "@/components/cards/ProductCard";
import DataRenderer from "@/components/DataRenderer";
import Pagination from "@/components/Pagination";
import { getProductsByCollections } from "@/lib/server actions/product.action";
import { RouteParams } from "@/types/global";
import type { Metadata } from "next";
import { Suspense } from "react";
import * as motion from "motion/react-client";

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { slug } = await params;

  const collectionName =
    slug === "all"
      ? "All Products"
      : `${slug.charAt(0).toUpperCase() + slug.slice(1)} Collection`;

  const description =
    slug === "all"
      ? "Browse our complete collection of activewear and lifestyle clothing. Shop all products with free shipping on orders over $50."
      : `Discover the ${slug} collection at Activo Store. Premium activewear and lifestyle clothing with free shipping on orders over $50.`;

  return {
    title: `Activo Store | ${collectionName}`,
    description: description,
    keywords: `${slug} collection, activewear, athletic clothing, ${slug} apparel`,
    openGraph: {
      title: `Activo Store | ${collectionName}`,
      description: description,
      url: `https://activo-store.vercel.app.com/collections/${slug}`,
      siteName: "Activo Store",
      images: [
        {
          url: "https://activo-store.vercel.app.com/og-collection.jpg",
          width: 1200,
          height: 630,
          alt: `${collectionName} - Activo Store`,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Activo Store | ${collectionName}`,
      description: description,
      images: ["https://activo-store.vercel.app.com/twitter-collection.jpg"],
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://activo-store.vercel.app.com/collections/${slug}`,
    },
  };
}

export default function Collections({ params, searchParams }: RouteParams) {
  return (
    <Suspense fallback={<Loading />}>
      <CollectionsContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function CollectionsContent({ params, searchParams }: RouteParams) {
  const [{ slug }, { pageSize, page }] = await Promise.all([
    params,
    searchParams,
  ]);

  if (!slug) {
    return NotFound();
  }

  const { success, data, error } = await getProductsByCollections({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 30,
    slug: slug,
  });
  const { items: products, isNext, total } = data || {};

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <motion.div 
      className="flex-center flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl px-5 w-full">
        <motion.h2 
          className="h2-semibold"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {slug === "all" ? "All Products" : `${slug} Collection`}
        </motion.h2>
        <DataRenderer
          success={success}
          error={error}
          data={products}
          empty={{ title: "No Products Found", message: "" }}
          render={(data) => (
            <>
              <motion.div 
                className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {data?.map((product) => (
                  <motion.div key={product._id} variants={itemVariants}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
              <motion.div 
                className="my-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
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