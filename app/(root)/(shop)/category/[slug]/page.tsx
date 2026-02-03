import NotFound from "@/app/not-found";
import ProductCard from "@/components/cards/ProductCard";
import DataRenderer from "@/components/DataRenderer";
import Pagination from "@/components/Pagination";
import { getCategoriedProducts } from "@/lib/server actions/product.action";
import { RouteParams } from "@/types/global";
import type { Metadata } from "next";
import { getCategoryBySlug } from "@/lib/server actions/category.action";

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

export default async function CategoriedProducts({
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
    <div className="flex-center flex-col">
      <div className="max-w-7xl px-5 w-full">
        <h2 className="h2-semibold"> {slug} </h2>
        <DataRenderer
          success={success}
          error={error}
          data={products}
          empty={{ title: "No Products Found", message: "" }}
          render={(data) => (
            <>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid:cols-6 gap-4">
                {data?.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              <div className="my-4">
                <Pagination
                  isNext={isNext}
                  total={total || 0}
                  pageSize={Number(pageSize) || 30}
                  page={Number(page) || 1}
                />
              </div>
            </>
          )}
        />
      </div>
    </div>
  );
}
