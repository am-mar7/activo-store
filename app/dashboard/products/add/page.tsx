import ProductFrom from "@/components/dashboard/forms/ProductFrom";
import { getCurrentSeason } from "@/lib/utils";

export default function AddProduct() {
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
        categories={[
          { _id: "69444958d641c54e31ed9b09", name: "Men's Clothing" },
          { _id: "cat-2", name: "Women's Clothing" },
          { _id: "cat-3", name: "Kids" },
          { _id: "cat-4", name: "Shoes" },
          { _id: "cat-5", name: "Bags & Backpacks" },
          { _id: "cat-6", name: "Watches" },
          { _id: "cat-7", name: "Jewelry" },
          { _id: "cat-8", name: "Sportswear" },
          { _id: "cat-9", name: "Formal Wear" },
          { _id: "cat-10", name: "Casual Wear" },
          { _id: "cat-11", name: "Winter Collection" },
          { _id: "cat-12", name: "Summer Collection" },
        ]}
      />
    </>
  );
}
