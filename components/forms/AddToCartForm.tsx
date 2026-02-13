"use client";

import { ProductType } from "@/types/global";
import { useEffect, useState, useTransition } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Minus, Package, Plus } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { upsertCartItem } from "@/lib/server actions/cart.action";
import { toast } from "sonner";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import BuyNowModal from "@/components/BuyNowModal";
import { colors as COLORS } from "@/constants";
type Props = Pick<
  ProductType,
  "variants" | "_id" | "title" | "images" | "newPrice"
>;

export default function AddToCartForm({
  variants,
  _id,
  title,
  images,
  newPrice,
}: Props) {
  const [color, setColor] = useState(variants[0].color);
  const [size, setSize] = useState(variants[0].size);
  const [sku, setSku] = useState(variants[0].sku);
  const [inCart, setInCart] = useState(false);
  const [upserting, startUpserting] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [stock, setStock] = useState(variants[0].stock);
  const [quantity, setQuantity] = useState(1);

  const [buyNowModalOpen, setBuyNowModalOpen] = useState(false);

  const sizes = [...new Set(variants.map((variant) => variant.size as string))];
  const colors = [
    ...new Set(variants.map((variant) => variant.color as string)),
  ];

  const handleUpsertCartItem = () => {
    setError(null);
    const variant = variants.find((v) => v.color === color && v.size === size);
    if (!variant) {
      setError("Some required inputs are missing recheck please.");
      return;
    }
    startUpserting(async () => {
      const type = inCart ? "update" : "add";
      const { success, error } = await upsertCartItem({
        sku,
        quantity,
        product: _id,
        type,
      });

      if (!success) {
        toast.error(getFriendlyErrorMessage(error));
        setError(getFriendlyErrorMessage(error));
      } else {
        useCartStore
          .getState()
          .addItem({ product: _id, variantSku: sku, quantity });
        setInCart(true);

        toast.success(
          <div className="flex items-center justify-between gap-3">
            <span>
              product {type === "add" ? "added" : "updated"} successfully
            </span>
            <a
              href="/cart"
              className="text-sm font-medium underline hover:no-underline"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = "/cart";
              }}
            >
              View Cart
            </a>
          </div>,
          {
            duration: 4000,
          }
        );
      }
    });
  };

  const handleBuyNow = () => {
    setError(null);
    const variant = variants.find((v) => v.color === color && v.size === size);
    if (!variant) {
      setError("Some required inputs are missing recheck please.");
      return;
    }

    // Open Buy Now modal
    setBuyNowModalOpen(true);
  };

  const handleChangeVariant = ({
    newSize,
    newColor,
  }: {
    newSize?: string;
    newColor?: string;
  }) => {
    if (!newSize) newSize = size;
    if (!newColor) newColor = color;
    variants.forEach((variant) => {
      if (variant.color === newColor && variant.size === newSize) {
        setStock(variant.stock);
        setQuantity(Math.min(quantity, variant.stock));
        setSku(variant.sku);
      }
    });
    if (newSize) setSize(newSize);
    if (newColor) setColor(newColor);
  };

  useEffect(() => {
    const isInCart = useCartStore.getState().isInCart(_id, sku);
    const item = useCartStore.getState().getItem(_id, sku);
    setInCart(isInCart);
    setQuantity(item?.quantity || 1);
  }, [_id, sku]);

  return (
    <>
      <div className="space-y-2.5 mb-5">
        <div className="mt-4">
          <p className="my-1 text-slate-500 body-regular">Size</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((currSize, idx) => (
              <Badge
                key={idx}
                className={`border ${
                  currSize === size
                    ? "bg-primary-gradient text-neutral-50 border-neutral-100"
                    : "border-slate-800"
                }`}
              >
                <button
                  onClick={() => handleChangeVariant({ newSize: currSize })}
                  className="base-regular w-full h-full px-4 py-1"
                >
                  {currSize.toUpperCase()}
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <div>
            <p className="my-1 text-slate-500 body-regular">Color</p>
            <div className="flex gap-2">
              {colors.map((currColor) => {
                const colorData = COLORS.find((c) => c.value === currColor);

                return (
                  <button
                    key={currColor}
                    onClick={() => handleChangeVariant({ newColor: currColor })}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      color === currColor
                        ? "border-slate-900 scale-105"
                        : "border-slate-300 hover:border-slate-400"
                    }`}
                    style={{ backgroundColor: colorData?.hex }}
                    aria-label={`Select ${colorData?.label || currColor} color`}
                    title={colorData?.label}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <p className="my-1 text-slate-500 body-regular">quantity</p>
          <div className="border-slate-900 border-2 flex gap-2 w-fit px-2 py-1">
            <button
              disabled={quantity === stock}
              onClick={() => setQuantity(Math.min(quantity + 1, stock))}
            >
              <Plus className={`${quantity === stock ? "opacity-50" : ""}`} />
            </button>

            <span className="px-4">{quantity}</span>
            <button
              disabled={quantity === 1}
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Minus className={`${quantity === 1 ? "opacity-50" : ""}`} />
            </button>
          </div>
        </div>

        <div>
          {error && (
            <p className="text-red-600 body-regular px-2 mb-0.5">{error}</p>
          )}

          {stock <= 10 && (
            <div className="space-y-2 px-3 py-2 bg-amber-50 border my-2 border-amber-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package size={18} className="text-amber-700" />
                  <p className="text-amber-700 small-regular">
                    Almost sold out!
                  </p>
                </div>
                <span className="text-amber-700 small-bold">{stock} left</span>
              </div>
              <div className="w-full bg-amber-200 rounded-full">
                <div
                  className="bg-amber-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${(stock / 10) * 100}%` }}
                />
              </div>
            </div>
          )}

          <Button
            disabled={stock === 0 || upserting}
            onClick={handleUpsertCartItem}
            className={`${
              stock === 0 ? "bg-slate-500 opacity-50" : "bg-primary-gradient"
            } px-4 py-2 w-full text-center text-neutral-50 ${
              upserting ? "opacity-50" : ""
            }`}
          >
            {stock === 0
              ? "Out of stock"
              : upserting
              ? inCart
                ? "Updating..."
                : "Adding..."
              : inCart
              ? "Update quantity"
              : "Add to cart"}
          </Button>

          <Button
            onClick={handleBuyNow}
            disabled={stock === 0}
            className={`border border-primary-700 px-4 py-2 w-full text-center text-slate-900 mt-1.5 ${
              stock === 0 ? "opacity-50" : ""
            }`}
          >
            {stock > 0 ? "Buy it Now" : "Out of stock"}
          </Button>
        </div>
      </div>

      {/* Buy Now Modal */}
      <BuyNowModal
        open={buyNowModalOpen}
        onOpenChange={setBuyNowModalOpen}
        productData={{
          productId: _id,
          variantSku: sku,
          variantColor: color,
          variantSize: size,
          productTitle: title,
          productImage: images[0],
          price: newPrice,
          quantity: quantity,
        }}
      />
    </>
  );
}
