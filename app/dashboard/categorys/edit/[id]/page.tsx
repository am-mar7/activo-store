import CategoryForm from "@/components/dashboard/forms/CategoryForm";
import {
  getCategories,
  getCategory,
} from "@/lib/server actions/category.action";
import { RouteParams } from "@/types/global";
import { notFound } from "next/navigation";

export default async function EditCategory({ params }: RouteParams) {
  const { id } = await params;
  const [{ data: category }, { data }] = await Promise.all([
    getCategory(id),
    getCategories({}),
  ]);
  const { categories } = data || {};
  const categoriesList = categories || [];
  console.log( "parentId" , category?.parentId);

  const categoriesSelectList = categoriesList.map((cat) => ({
    name: cat.name,
    _id: cat._id,
    parentId: cat.parentId,
  }));
  if (!category) return notFound();

  return (
    <CategoryForm
      formType="EDIT"
      categories={categoriesSelectList}
      defaultValues={{ name: category.name, parentId: category.parentId }}
      existingImageUrl={category.image}
      id={category._id}
    />
  );
}
