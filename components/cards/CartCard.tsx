import Image from "next/image";
import { ProductType } from "@/types/global";
import RemoveFromCart from "../buttons/RemoveFromCart";
import QuantiityController from "../buttons/QuantiityController";

interface Props {
  product: ProductType;
  variantSku: string;
  initialQuantity: number;
}

export default function CartCard({
  product,
  variantSku,
  initialQuantity,
}: Props) {
  const variant = product.variants.find((v) => v.sku === variantSku);
  console.log("initialQuantity", initialQuantity);

  return (
    <div className="bg-white rounded-lg border w-full border-slate-200 p-4 hover:shadow-md transition-shadow duration-200 relative">
      <div className="flex items-center gap-4 ">
        <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 lg:w-26 lg:h-26 bg-slate-100 rounded-lg overflow-hidden relative">
          <Image
            src={product.images[0] || "/placeholder.png"}
            alt={product.title}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-3 mb-1">
            <div className="flex-1">
              <h3 className="small-semibold xs:body-semibold text-slate-900 line-clamp-2">
                {product.title}
              </h3>

              {variant && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-4 h-4 rounded-full border border-slate-300"
                      style={{ backgroundColor: variant.color }}
                    />
                    <span className="small-regular xs:text-xs sm:text-sm text-slate-600 capitalize">
                      {variant.color}
                    </span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <span className="small-regular xs:text-xs sm:text-sm text-slate-600 uppercase">
                    {variant.size}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-between">
            <span className="small-medium xs: xs:base-medium font-bold text-slate-900">
              EGP {product.newPrice.toFixed(2)}
            </span>
            <QuantiityController
              productId={product._id}
              initialQuantity={initialQuantity}
              variantSku={variantSku}
            />
          </div>
        </div>
      </div>
      <RemoveFromCart
        productId={product._id}
        variantSku={variantSku}
        className="absolute right-2 top-2"
      />
    </div>
  );
}
