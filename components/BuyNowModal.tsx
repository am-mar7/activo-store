"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { IAddress } from "@/models/user.model";
import { useSession } from "next-auth/react";
import api from "@/lib/api";
import { ActionResponse } from "@/types/global";
import { IUserDoc } from "@/models/user.model";
import AddressSelector, {
  AddressSelectorHandle,
} from "@/components/address-control/AddressSelector";
import PaymentMethodSelector from "@/components/address-control/PaymentMethodSelector";
import { PlaceOrder } from "@/lib/server actions/order.action";
import { upsertOrderParams } from "@/types/global";
import { toast } from "sonner";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { useSettingsStore } from "@/stores/useSettingsStore";
import {
  addAddress,
  setAddressAsDefault,
} from "@/lib/server actions/addresses.action";
import { formatAddress } from "@/lib/utils";
import { useRouter } from "next/navigation";
import ROUTES from "@/constants/routes";

interface BuyNowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productData: {
    productId: string;
    variantSku?: string;
    variantColor?: string;
    variantSize?: string;
    productTitle: string;
    productImage: string;
    price: number;
    quantity: number;
  };
}

export default function BuyNowModal({
  open,
  onOpenChange,
  productData,
}: BuyNowModalProps) {
  const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<IAddress[]>([]);
  const [method, setMethod] = useState<"COD" | "visa">("COD");

  const addressRef = useRef<AddressSelectorHandle>(null);
  const session = useSession();
  const userId = session.data?.user.id;
  const router = useRouter();

  const checkout = useSettingsStore((state) => state.getCheckout());
  const shipping = useSettingsStore((state) => state.getShipping());
  const allowCOD = checkout?.allowCOD ?? true;
  const allowOnlinePayment = checkout?.allowOnlinePayment ?? false;
  const shippingCost = shipping?.cost || 0;

  const subtotal = productData.price * productData.quantity;
  const total = subtotal + shippingCost;

  const handlePlaceOrder = async () => {
    const addressData = await addressRef.current?.getAddressData();

    if (!addressData) {
      toast.error("Please fill in all required address fields");
      return;
    }

    setLoading(true);

    try {
      const { address, isDefault, isExisting } = addressData;

      const orderItems = [
        {
          product: productData.productId,
          variantSku: productData.variantSku,
          variantColor: productData.variantColor,
          variantSize: productData.variantSize,
          productTitle: productData.productTitle,
          productImage: productData.productImage,
          priceAtPurchase: productData.price,
          quantity: productData.quantity,
          subTotal: subtotal,
        },
      ];

      const params: upsertOrderParams = {
        totalPrice: total,
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

      // Place order
      const { success, error } = await PlaceOrder(params, "BUY_NOW");

      if (success) {
        toast.success("Order placed successfully!");
        onOpenChange(false);
        router.push(ROUTES.PROFILE);
      } else {
        toast.error(getFriendlyErrorMessage(error));
      }
    } catch (error) {
      console.error("Buy now failed:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load addresses when modal opens
  useEffect(() => {
    if (open && userId) {
      const loadAddresses = async () => {
        const { data } = (await api.users.getById(
          userId
        )) as ActionResponse<IUserDoc>;
        if (data && data.addresses.length > 0) {
          setSavedAddresses(data.addresses);
        }
      };
      loadAddresses();
    }
  }, [open, userId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Complete Your Order
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Shipping Information */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">
              Shipping Information
            </h3>
            <AddressSelector
              ref={addressRef}
              savedAddresses={savedAddresses}
              showDefaultCheckbox={false} // Fast checkout, no need for default
            />
          </div>

          {/* Payment Method */}
          <div>
            <PaymentMethodSelector
              value={method}
              onChange={setMethod}
              allowCOD={allowCOD}
              allowOnlinePayment={allowOnlinePayment}
            />
          </div>

          {/* Price Summary (Simple) */}
          <div className="border-t pt-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{subtotal.toFixed(2)} EGP</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="text-green-600">
                  {shippingCost === 0 ? "Free" : `${shippingCost} EGP`}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-base text-slate-900 border-t pt-2">
                <span>Total</span>
                <span>{total.toFixed(2)} EGP</span>
              </div>
            </div>
          </div>

          {/* Place Order Button */}
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full px-4 py-3 bg-primary-600 text-neutral-50 font-medium rounded-lg hover:bg-primary-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              `Place Order - ${total.toFixed(2)} EGP`
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
