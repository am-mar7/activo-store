import ProductFrom from "@/components/dashboard/forms/ProductFrom";
import { getCategories } from "@/lib/server actions/category.action";
import { getCurrentSeason } from "@/lib/utils";

export default async function AddProduct() {
  const { data } = await getCategories({});
  const { categories } = data || {};
  const categoriesList = categories || [];
  const categoriesSelectList = categoriesList.map((cat) => ({
    name: cat.name,
    _id: cat._id,
  }));
  return (
    <>
      <ProductFrom
        formType="ADD"
        defaultValues={{
          title: "",
          description: "",
          category: [],
          newPrice: 0,
          collection: getCurrentSeason(),
        }}
        categories={categoriesSelectList}
      />
    </>
  );
}
