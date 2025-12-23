import ProductFrom from "@/components/dashboard/forms/ProductFrom";
import { getCategories } from "@/lib/server actions/category.action";
import { getProduct } from "@/lib/server actions/product.action";
import { RouteParams } from "@/types/global";
import { notFound } from "next/navigation";

export default async function EditProduct({ params }: RouteParams) {
  const { id } = await params;
  const [{ data }, { data: product }] = await Promise.all([
    getCategories({}),
    getProduct(id),
  ]);
  const { categories } = data || {};
  const categoriesList = categories || [];
  const categoriesSelectList = categoriesList.map((cat) => ({
    name: cat.name,
    _id: cat._id,
  }));
  if (!product) return notFound();
  const { title, description, category, newPrice, oldPrice, collection } =
    product;
  return (
    <>
      <ProductFrom
        formType="EDIT"
        defaultValues={{
          title,
          description,
          category,
          newPrice,
          collection,
          oldPrice,          
        }}
        id={product._id}
        oldImages={product.images}
        categories={categoriesSelectList}
        oldVariants={product.variants}
      />
    </>
  );
}
