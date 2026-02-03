import NotFound from "@/app/not-found";
import ProductCard from "@/components/cards/ProductCard";
import DataRenderer from "@/components/DataRenderer";
import Pagination from "@/components/Pagination";
import { getProductsByCollections } from "@/lib/server actions/product.action";
import { RouteParams } from "@/types/global";
import type { Metadata } from 'next'



export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params
  
  const collectionName = slug === 'all' ? 'All Products' : `${slug.charAt(0).toUpperCase() + slug.slice(1)} Collection`
  
  const description = slug === 'all' 
    ? 'Browse our complete collection of activewear and lifestyle clothing. Shop all products with free shipping on orders over $50.'
    : `Discover the ${slug} collection at Activo Store. Premium activewear and lifestyle clothing with free shipping on orders over $50.`

  return {
    title: `Activo Store | ${collectionName}`,
    description: description,
    keywords: `${slug} collection, activewear, athletic clothing, ${slug} apparel`,
    openGraph: {
      title: `Activo Store | ${collectionName}`,
      description: description,
      url: `https://activo-store.vercel.app.com/collections/${slug}`,
      siteName: 'Activo Store',
      images: [
        {
          url: 'https://activo-store.vercel.app.com/og-collection.jpg',
          width: 1200,
          height: 630,
          alt: `${collectionName} - Activo Store`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Activo Store | ${collectionName}`,
      description: description,
      images: ['https://activo-store.vercel.app.com/twitter-collection.jpg'],
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://activo-store.vercel.app.com/collections/${slug}`,
    },
  }
}

export default async function Collections({
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

  const { success, data, error } = await getProductsByCollections({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 30,
    slug: slug,
  });
  const { items: products, isNext, total } = data || {};

  return (
    <div className="flex-center flex-col ">
      <div className="max-w-7xl px-5 w-full">
        <h2 className="h2-semibold">
          {" "}
          {slug === "all" ? "All Products" : `${slug} Collection`}{" "}
        </h2>
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
