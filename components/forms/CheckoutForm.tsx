"use client";

import { cn, formatAddress } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { IAddress } from "@/models/user.model";
import { motion } from "framer-motion";
import { cartItem, upsertOrderParams } from "@/types/global";
import { PlaceOrder } from "@/lib/server actions/order.action";
import {
  addAddress,
  setAddressAsDefault,
} from "@/lib/server actions/addresses.action";
import { useCartStore } from "@/stores/useCartStore";
import api from "@/lib/api";
import { IUserDoc } from "@/models/user.model";
import { ActionResponse } from "@/types/global";
import { useSession } from "next-auth/react";
import { getPromoCodeByCode } from "@/lib/server actions/promocode.action";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { toast } from "sonner";
import AddressSelector, {
  AddressSelectorHandle,
} from "../address-control/AddressSelector";
import PaymentMethodSelector from "../address-control/PaymentMethodSelector";

interface Props {
  subTotal: number;
  items: cartItem[];
  className?: string;
  shippingCost: number;
}

export default function CheckoutForm({
  subTotal,
  className,
  items,
  shippingCost,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [promoCode, setPromoCode] = useState<string>();
  const [promoQuery, setPromoQuery] = useState<string>("");
  const [promoError, setPromoError] = useState<string>();

  const checkPromo = async () => {
    setPromoLoading(true);
    setPromoError(undefined);
    setPromoCode(undefined);
    setDiscount(0);
    setDiscountAmount(0);
    const { success, error, data } = await getPromoCodeByCode(
      promoQuery?.toUpperCase() || ""
    );
    if (error || !success || !data)
      setPromoError(getFriendlyErrorMessage(error));
    else {
      setDiscount(data.percentage);
      const amount = (subTotal * data.percentage) / 100;
      setDiscountAmount(Number(amount.toFixed(2)));
      setPromoCode(data.code);
    }
    setPromoLoading(false);
  };

  return (
    <>
      <div className={cn(className, "mb-2")}>
        <h2 className="base-bold font-semibold text-primary mb-4">
          Order Summary
        </h2>
        <div className="space-y-2">
          <div className="flex justify-between text-neutral-500 body-regular">
            <span>Sub Total</span>
            <span>{subTotal.toFixed(2)} EGP</span>
          </div>
          <div className="flex-between text-neutral-500 body-regular">
            <span>Shipping</span>
            <span className="text-green-600">
              {shippingCost === 0 ? "Free" : shippingCost + " EGP"}
            </span>
          </div>

          {/* promoCode form  */}
          <div className="py-2">
            <label className="block text-slate-700 text-sm font-medium mb-1">
              Promo Code
            </label>
            <div className="flex flex-col xs:flex-row sm:flex-col xl:flex-row gap-2">
              <input
                type="text"
                value={promoQuery || ""}
                onChange={(e) => setPromoQuery(e.target.value)}
                placeholder="Enter a code to get discount"
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-primary-900 outline-none transition-all"
              />
              <button
                disabled={promoLoading}
                onClick={checkPromo}
                className="bg-primary-600 hover:bg-primary-700 text-neutral-50 px-4 py-2 rounded-lg body-regular transition-all"
              >
                {promoLoading ? (
                  <Loader2 className="animate-spin text-neutral-50 text-2xl mx-auto" />
                ) : (
                  "Confirm"
                )}
              </button>
            </div>

            {promoError && (
              <p className="text-red-500 small-regular mt-1">
                Invalid promo code
              </p>
            )}

            {discountAmount > 0 && (
              <p className="text-green-600 small-regular mt-1">
                {"Congrats! You saved " + discountAmount + " " + "EGP"}
              </p>
            )}
          </div>

          <div className="flex justify-between text-neutral-500 body-regular">
            <span>Total</span>
            <span>
              {(subTotal - discountAmount + shippingCost).toFixed(2)} EGP
            </span>
          </div>

          <button
            className="w-full px-4 py-2 text-neutral-50 body-regular transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? "Hide form" : "Checkout"}
          </button>
        </div>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Checkout
            promoCode={promoCode}
            totalPrice={subTotal - discountAmount + shippingCost}
            shippingCost={shippingCost}
            discount={discount}
            discountAmount={discountAmount}
            items={items}
          />
        </motion.div>
      )}
    </>
  );
}

interface CheckoutProps {
  totalPrice: number;
  promoCode?: string;
  discount?: number;
  discountAmount?: number;
  shippingCost: number;
  items: cartItem[];
}

const Checkout: React.FC<CheckoutProps> = ({
  totalPrice,
  promoCode,
  discount = 0,
  discountAmount = 0,
  shippingCost,
  items,
}) => {
  const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<IAddress[]>([]);
  const [method, setMethod] = useState<"COD" | "visa">("COD");

  const addressRef = useRef<AddressSelectorHandle>(null);

  const session = useSession();
  const userId = session.data?.user.id;

  const checkout = useSettingsStore((state) => state.getCheckout());
  const allowCOD = checkout?.allowCOD;
  const allowOnlinePayment = checkout?.allowOnlinePayment;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get validated address data from AddressSelector
    const addressData = await addressRef.current?.getAddressData();

    if (!addressData) {
      toast.error("Please fill in all required address fields");
      return;
    }

    setLoading(true);

    try {
      const { address, isDefault, isExisting } = addressData;

      const promoObj = promoCode
        ? {
            code: promoCode,
            discount,
            discountAmount,
          }
        : undefined;

      const orderItems = items.map((item) => ({
        product: item.product._id,
        variantSku: item.variantSku,
        variantColor: item.product.variants?.find(
          (v) => v.sku === item.variantSku
        )?.color,
        variantSize: item.product.variants?.find(
          (v) => v.sku === item.variantSku
        )?.size,
        productTitle: item.product.title,
        productImage: item.product.images[0],
        priceAtPurchase: item.product.newPrice,
        quantity: item.quantity,
        subTotal: item.quantity * item.product.newPrice,
      }));

      const params: upsertOrderParams = {
        totalPrice,
        promoCode: promoObj,
        shippingCost,
        payment: {
          method,
          status: "pending",
        },
        shippingAddress: {
          city: address.city,
          details: address.details,
          phone: address.phone,
        },
        orderItems,
      };

      // Save new address or update default
      if (!isExisting) {
        const formattedAddress = formatAddress(address);
        const existingAddress = savedAddresses.find(
          (addr) =>
            addr.city.toLowerCase() === formattedAddress.city.toLowerCase() &&
            addr.phone === formattedAddress.phone &&
            addr.details.toLowerCase() ===
              formattedAddress.details.toLowerCase()
        );

        if (!existingAddress) {
          await addAddress({ ...formattedAddress, isDefault });
        } else if (isDefault && existingAddress._id) {
          await setAddressAsDefault(existingAddress._id.toString());
        }
      } else {
        if (isDefault) {
          const selectedAddress = savedAddresses.find(
            (addr) =>
              addr.city === address.city &&
              addr.phone === address.phone &&
              addr.details === address.details
          );
          if (selectedAddress?._id) {
            await setAddressAsDefault(selectedAddress._id.toString());
          }
        }
      }

      const { success, error } = await PlaceOrder(params);
      if (success) {
        useCartStore.getState().clearCart();
        toast.success("Order placed successfully!");
      } else {
        toast.error(getFriendlyErrorMessage(error));
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      toast.error("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadAddresses = async () => {
      if (!userId) return;
      const { data } = (await api.users.getById(
        userId
      )) as ActionResponse<IUserDoc>;
      if (data && data.addresses.length > 0) {
        setSavedAddresses(data.addresses);
      }
    };
    loadAddresses();
  }, [userId]);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6 my-4 transition-all">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        Shipping Information
      </h3>

      {/* Address Selector */}
      <AddressSelector
        ref={addressRef}
        savedAddresses={savedAddresses}
        showDefaultCheckbox={true}
      />

      {/* Payment Method Selector - NOW USING COMPONENT */}
      <div className="my-6">
        <PaymentMethodSelector
          value={method}
          onChange={setMethod}
          allowCOD={allowCOD}
          allowOnlinePayment={allowOnlinePayment}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full mt-6 px-3 py-2 bg-primary-600 text-neutral-50 body-medium rounded-lg hover:bg-primary-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          "Place Order"
        )}
      </button>
    </div>
  );
};
