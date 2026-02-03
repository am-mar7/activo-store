import NotFound from "@/app/not-found";
import ProductCard from "@/components/cards/ProductCard";
import DataRenderer from "@/components/DataRenderer";
import Pagination from "@/components/Pagination";
import { getProductsByCollections } from "@/lib/server actions/product.action";
import { RouteParams } from "@/types/global";

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
