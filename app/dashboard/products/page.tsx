import DataCard from "@/components/dashboard/cards/DataCard";
import DataRenderer from "@/components/DataRenderer";
import LocalSearch from "@/components/searchbars/LocalSearch";
import { DASHBOARDROUTES } from "@/constants/routes";
import { getProducts } from "@/lib/server actions/product.action";
import { RouteParams } from "@/types/global";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function Products({ searchParams }: RouteParams) {
  const { page, query, filter } = await searchParams;
  const { data, success, error } = await getProducts({
    page: Number(page) || 1,
    query,
    filter,
  });
  const { products } = data || {};
  return (
    <div className="max-w-7xl">
      <div className="flex flex-col xs:flex-row gap-2 items-center">
        <div className="flex-1 max-xs:w-full">
          <LocalSearch
            route={DASHBOARDROUTES.PRODUCTS}
            placeholder="search for products"
          />
        </div>

        <Link
          href={DASHBOARDROUTES.ADDPRODUCT}
          className="h-14 max-xs:w-full flex gap-1 bg-primary-gradient text-neutral-50 p-3.5 rounded-lg"
        >
          <Plus />
          Add Product
        </Link>
      </div>
      <DataRenderer
        data={products}
        success={success}
        render={(data) => (
          <div className="mt-8 flex flex-col gap-4">
            {data?.map(({ title, _id, images }) => (
              <DataCard
                _id={_id}
                type="product"
                key={_id}
                title={title}
                image={images[0]}
                href={DASHBOARDROUTES.EDITPRODUCT(_id)}
              />
            ))}
          </div>
        )}
        empty={{
          title: "No Products Found",
          message: "There are no products available. Please add some.",
          button: {
            text: "Add Product",
            href: DASHBOARDROUTES.ADDPRODUCT,
          },
        }}
        error={error}
      />
    </div>
  );
}
