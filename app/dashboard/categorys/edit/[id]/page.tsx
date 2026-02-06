import Loading from "@/app/loading";
import CategoryForm from "@/components/dashboard/forms/CategoryForm";
import {
  getCategories,
  getCategory,
} from "@/lib/server actions/category.action";
import { RouteParams } from "@/types/global";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default function AddCategory({ params, searchParams }: RouteParams) {
  return (
    <Suspense fallback={<Loading />}>
      <EditCategoryContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function EditCategoryContent({ params }: RouteParams) {
  const { id } = await params;
  const [{ data: category }, { data }] = await Promise.all([
    getCategory(id),
    getCategories({}),
  ]);
  const { categories } = data || {};
  const categoriesList = categories || [];
  console.log("parentId", category?.parentId);

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
