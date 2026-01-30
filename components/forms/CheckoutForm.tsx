"use client";

import { cn, formatAddress } from "@/lib/utils";
import { Loader2, MapPin, Phone, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { IAddress } from "@/models/user.model";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addressFormSchema } from "@/lib/validation";
import { getPromoCodeByCode } from "@/lib/server actions/promocode.action";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { useSettingsStore } from '@/stores/useSettingsStore';
interface Props {
  subTotal: number;
  items: cartItem[];
  className?: string;
}

export default function CheckoutForm({ subTotal, className, items }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [promoCode, setPromoCode] = useState<string>();
  const [promoQuery, setPromoQuery] = useState<string>("");
  const [promoError, setPromoError] = useState<string>();

  const shipping = useSettingsStore(state => state.getShipping());
  const shippingCost = shipping?.baseCost || 0;

  const checkPromo = async() => {
    setPromoLoading(true);
    setPromoError(undefined);
    setPromoCode(undefined);
    setDiscount(0);
    setDiscountAmount(0);
    const {success , error , data} = await getPromoCodeByCode(promoQuery?.toUpperCase()|| "");
    if(error || !success || !data) setPromoError(getFriendlyErrorMessage(error));
    else {
      setDiscount(data.percentage);
      const amount = (subTotal * data.percentage) / 100
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

type AddressFormValues = z.infer<typeof addressFormSchema>;

const Checkout: React.FC<CheckoutProps> = ({
  totalPrice,
  promoCode,
  discount = 0,
  discountAmount = 0,
  shippingCost,
  items,
}) => {
  const [loading, setLoading] = useState(false);
  const [useExistingAddress, setUseExistingAddress] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<IAddress[]>([]);
  const [setAsDefault, setSetAsDefault] = useState(true);
  const [method, setMethod] = useState<"COD" | "visa">("COD");
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    mode: "onTouched",
    defaultValues: {
      city: "",
      phone: "",
      details: "",
    },
  });

  const session = useSession();
  const userId = session.data?.user.id;
  
  const checkout = useSettingsStore(state => state.getCheckout());
  const allowCOD = checkout?.allowCOD;
  const allowOnlinePayment = checkout?.allowOnlinePayment;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!useExistingAddress) {
      const isValid = await form.trigger();
      if (!isValid) return;
    }

    setLoading(true);

    try {
      let finalAddress = useExistingAddress
        ? savedAddresses[selectedAddressIndex]
        : {
            city: form.getValues("city"),
            phone: form.getValues("phone"),
            details: form.getValues("details"),
            isDefault: false,
          };

      if (setAsDefault) finalAddress.isDefault = true;

      finalAddress = {
        ...formatAddress(finalAddress),
        isDefault: finalAddress.isDefault,
      };
      console.log("formatedAddress", finalAddress);

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
        variantColor: item.product.variants.find(
          (v) => v.sku === item.variantSku
        )?.color,
        varinatSize: item.product.variants.find(
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
          city: finalAddress.city,
          details: finalAddress.details,
          phone: finalAddress.phone,
        },
        orderItems,
      };

      if (!useExistingAddress) {
        const newAddress = finalAddress;
        const existingAddress = savedAddresses.find(
          (addr) =>
            addr.city.toLowerCase() === newAddress.city.toLowerCase() &&
            addr.phone === newAddress.phone &&
            addr.details.toLowerCase() === newAddress.details.toLowerCase()
        );

        if (!existingAddress) addAddress(newAddress);
        else if (setAsDefault && existingAddress._id)
          setAddressAsDefault(existingAddress._id?.toString());
      } else {
        if (setAsDefault) {
          const addressId =
            savedAddresses[selectedAddressIndex]._id?.toString();
          if (addressId) setAddressAsDefault(addressId);
        }
      }

      const { success, error } = await PlaceOrder(params);
      if (success) useCartStore.getState().clearCart();
      console.log(success, error);
    } catch (error) {
      console.error("Checkout failed:", error);
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
        setUseExistingAddress(true);
        setSetAsDefault(false);
        const defaultIndex = data.addresses.findIndex((add) => add.isDefault);
        setSelectedAddressIndex(Math.max(defaultIndex, 0));
      }
    };
    loadAddresses();
  }, [userId]);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6 my-4 transition-all">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        Shipping Information
      </h3>

      {/* Saved Addresses */}
      {savedAddresses.length > 0 && (
        <div className="mb-6">
          <label className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={useExistingAddress}
              onChange={(e) => setUseExistingAddress(e.target.checked)}
              className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-slate-700">
              Use saved address
            </span>
          </label>

          {useExistingAddress && (
            <div className="space-y-3 pl-0 sm:pl-6">
              {savedAddresses.map((addr, index) => (
                <label
                  key={index}
                  className="flex items-start gap-3 p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-primary-300 has-checked:border-primary-600 has-checked:bg-primary-50"
                >
                  <input
                    type="radio"
                    name="savedAddress"
                    checked={selectedAddressIndex === index}
                    onChange={() => setSelectedAddressIndex(index)}
                    className="mt-1 w-4 h-4 text-primary-600 border-slate-300 focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="font-medium text-slate-900 text-sm sm:text-base">
                        {addr.city}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 ml-6">
                      {addr.details}
                    </p>
                    <div className="flex items-center gap-2 mt-1 ml-6">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span className="text-xs sm:text-sm text-slate-500">
                        {addr.phone}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Address Form - Using React Hook Form */}
      {(!useExistingAddress || savedAddresses.length === 0) && (
        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <MapPin className="w-4 h-4" />
                    City <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Cairo"
                      {...field}
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Phone className="w-4 h-4" />
                    Phone Number <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+20 123 456 7890"
                      {...field}
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Home className="w-4 h-4" />
                    Detailed Address <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Street address, building number, apartment, floor, landmarks..."
                      {...field}
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-200 outline-none transition-all resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Form>
      )}

      {savedAddresses.length > 0 && (
        <div className="flex items-center gap-3 my-3">
          <Checkbox
            id="terms"
            checked={setAsDefault}
            onCheckedChange={(checked) => setSetAsDefault(checked as boolean)}
          />
          <Label htmlFor="terms">Set this as default address</Label>
        </div>
      )}

      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-700 mb-3">
          Payment Method
        </h4>

        <RadioGroup
          value={method}
          onValueChange={(value) => setMethod(value as "COD" | "visa")}
        >
          <div className="flex items-center space-x-3 p-2 border-2 rounded-lg">
            <RadioGroupItem value="COD" id="cod" disabled={allowCOD} />
            <Label htmlFor="cod" className="cursor-pointer small-medium">
              Cash on Delivery
            </Label>
          </div>

          <div className="flex items-center space-x-3 p-2 border-2 rounded-lg opacity-50">
            <RadioGroupItem value="visa" id="visa" disabled={!allowOnlinePayment} />
            <Label htmlFor="visa" className="cursor-not-allowed small-medium">
              Credit/Debit Card (Coming Soon)
            </Label>
          </div>
        </RadioGroup>
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
