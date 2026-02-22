import Loading from "@/app/loading";
import ProductFrom from "@/components/dashboard/forms/ProductFrom";
import { getCategories } from "@/lib/server actions/category.action";
import { getProduct } from "@/lib/server actions/product.action";
import { RouteParams } from "@/types/global";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default function EditProduct({ params, searchParams }: RouteParams) {
  return (
    <Suspense fallback={<Loading />}>
      <EditProductContent params={params} searchParams={searchParams} />{" "}
    </Suspense>
  );
}

async function EditProductContent({ params }: RouteParams) {
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
  const {
    _id,
    title,
    description,
    category,
    newPrice,
    oldPrice,
    collection,
    variants,
    images,
    sizeGuide,
    stock,
  } = product;
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
          stock,
        }}
        id={_id}
        oldImages={images}
        categories={categoriesSelectList}
        oldVariants={variants}
        oldSizeGuide={sizeGuide}
      />
    </>
  );
}
