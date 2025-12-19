import CategoryForm from "@/components/dashboard/forms/CategoryForm";
import { getCategories } from "@/lib/server actions/category.action";

export default async function AddCategory() {
  const { data } = await getCategories({});
  const { categories } = data || {};
  const categoriesList = categories || [];
  const categoriesSelectList = categoriesList.map((cat) => ({
    name: cat.name,
    _id: cat._id,
  }));
  return (
    <>
      <CategoryForm
        formType="ADD"
        defaultValues={{
          name: "",
        }}
        categories={categoriesSelectList}
      />
    </>
  );
}
