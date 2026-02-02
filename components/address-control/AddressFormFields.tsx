"use client";

import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Home } from "lucide-react";
import { addressFormSchema } from "@/lib/validation";

type AddressFormValues = z.infer<typeof addressFormSchema>;

interface AddressFormFieldsProps {
  form: UseFormReturn<AddressFormValues>;
  showDefaultCheckbox?: boolean;
  isDefault?: boolean;
  onDefaultChange?: (checked: boolean) => void;
}

export default function AddressFormFields({
  form,
  showDefaultCheckbox = false,
  isDefault = false,
  onDefaultChange,
}: AddressFormFieldsProps) {
  return (
    <div className="space-y-4">
      {/* City Field */}
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

      {/* Phone Field */}
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

      {/* Details Field */}
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

      {/* Optional Default Checkbox */}
      {showDefaultCheckbox && (
        <div className="flex items-center gap-3 pt-2">
          <Checkbox
            className="bg-neutral-200! border-neutral-400!"
            id="isDefault"
            checked={isDefault}
            onCheckedChange={(checked) => onDefaultChange?.(checked as boolean)}
          />
          <Label htmlFor="isDefault" className="cursor-pointer">
            Set this as default address
          </Label>
        </div>
      )}
    </div>
  );
}