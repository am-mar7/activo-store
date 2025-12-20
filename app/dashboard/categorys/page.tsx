import DataCard from "@/components/dashboard/cards/DataCard";
import DataRenderer from "@/components/DataRenderer";
import LocalSearch from "@/components/searchbars/LocalSearch";
import { DASHBOARDROUTES } from "@/constants/routes";
import { getCategories } from "@/lib/server actions/category.action";
import { RouteParams } from "@/types/global";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function Category({ searchParams }: RouteParams) {
  const { page, query } = await searchParams;
  const { data, success, error } = await getCategories({
    page: Number(page) || 1,
    query,
  });
  const { categories } = data || {};
  return (
    <div className="max-w-7xl">
      <div className="flex flex-col xs:flex-row gap-2 items-center">
        <div className="flex-1 max-xs:w-full">
          <LocalSearch
            route={DASHBOARDROUTES.CATEGORY}
            placeholder="search for categories"
          />
        </div>

        <Link
          href={DASHBOARDROUTES.ADDCATEGORY}
          className="h-14 max-xs:w-full flex gap-1 bg-primary-gradient text-neutral-50 p-3.5 rounded-lg"
        >
          <Plus />
          Add Category
        </Link>
      </div>
      <DataRenderer
        data={categories}
        success={success}
        render={(data) => (
          <div className="mt-8 flex flex-col gap-4">
            {data?.map(({ name, _id, image }) => (
              <DataCard
                _id={_id}
                type="category"
                key={_id}
                title={name}
                image={image}
                href={DASHBOARDROUTES.EDITCATEGORY}
              />
            ))}
          </div>
        )}
        empty={{
          title: "No Categories Found",
          message: "There are no categories available. Please add some.",
          button: {
            text: "Add Category",
            href: DASHBOARDROUTES.ADDCATEGORY,
          },
        }}
        error={error}
      />
    </div>
  );
}
