"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface PaymentMethodSelectorProps {
  value: "COD" | "visa";
  onChange: (value: "COD" | "visa") => void;
  allowCOD?: boolean;
  allowOnlinePayment?: boolean;
}

export default function PaymentMethodSelector({
  value,
  onChange,
  allowCOD = true,
  allowOnlinePayment = false,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-slate-700">Payment Method</h4>

      <RadioGroup
        value={value}
        onValueChange={(val) => onChange(val as "COD" | "visa")}
      >
        {/* Cash on Delivery */}
        <div
          className={`flex items-center space-x-3 p-3 border-2 rounded-lg transition-all ${
            value === "COD"
              ? "border-primary-600 bg-primary-50"
              : "border-slate-200"
          } ${!allowCOD ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <RadioGroupItem value="COD" id="cod" disabled={!allowCOD} />
          <Label
            htmlFor="cod"
            className={`flex-1 ${
              allowCOD ? "cursor-pointer" : "cursor-not-allowed"
            } small-medium`}
          >
            Cash on Delivery
          </Label>
        </div>

        {/* Credit/Debit Card */}
        <div
          className={`flex items-center space-x-3 p-3 border-2 rounded-lg transition-all ${
            value === "visa"
              ? "border-primary-600 bg-primary-50"
              : "border-slate-200"
          } ${
            !allowOnlinePayment ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          <RadioGroupItem
            value="visa"
            id="visa"
            disabled={!allowOnlinePayment}
          />
          <Label
            htmlFor="visa"
            className={`flex-1 ${
              allowOnlinePayment ? "cursor-pointer" : "cursor-not-allowed"
            } small-medium`}
          >
            <span>Credit/Debit Card</span>
            {!allowOnlinePayment && (
              <span className="text-slate-400 ml-2">(Coming Soon)</span>
            )}
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}