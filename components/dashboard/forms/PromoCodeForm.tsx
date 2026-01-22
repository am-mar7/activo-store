"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { DASHBOARDROUTES } from "@/constants/routes";
import z from "zod";
import {
  addPromoCode,
  editPromoCode,
} from "@/lib/server actions/promocode.action";
import { PromoCodeSchema } from "@/lib/validation";

type PromoCodeFormValues = z.infer<typeof PromoCodeSchema>;

type PromoCodeFormType = {
  defaultValues: PromoCodeFormValues;
  formType: "ADD" | "EDIT";
  id?: string;
};

export default function PromoCodeForm({
  defaultValues,
  formType,
  id,
}: PromoCodeFormType) {
  const [error, setError] = useState<string | null>(null);
  const form = useForm<PromoCodeFormValues>({
    resolver: zodResolver(PromoCodeSchema),
    defaultValues: defaultValues,
  });

  const router = useRouter();

  const handleSubmit = async function (data: PromoCodeFormValues) {
    console.log("Submitting form with data:", data);

    if (formType === "ADD") {
      const { success, error } = await addPromoCode(data);
      if (success) {
        router.push(DASHBOARDROUTES.PROMOCODES);
        toast.success("Promo code added successfully");
      } else {
        setError(getFriendlyErrorMessage(error));
      }
    } else {
      const { success, error } = await editPromoCode({
        id: id!,
        ...data,
      });
      if (success) {
        router.push(DASHBOARDROUTES.PROMOCODES);
        toast.success("Promo code updated successfully");
      } else {
        setError(getFriendlyErrorMessage(error));
      }
    }
  };

  const buttonText =
    formType === "ADD" ? "Add Promo Code" : "Update Promo Code";

  return (
    <div className="space-y-3 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-8 py-5">
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex-1 space-y-6 bg-white rounded-lg border p-6 shadow-sm max-w-3xl"
          >
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">
                {formType === "ADD" ? "Add New Promo Code" : "Edit Promo Code"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Fill in the promo code details below
              </p>
            </div>

            {/* Code Field */}
            <FormField
              name="code"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promo Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., SUMMER2026"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                      className="bg-slate-50 uppercase"
                      disabled={formType === "EDIT"}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    {formType === "EDIT"
                      ? "Code cannot be changed after creation"
                      : "Enter a unique code (will be converted to uppercase)"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Percentage and Max Discount - Side by Side */}
            <div className="grid lg:grid-cols-2 gap-4">
              <FormField
                name="percentage"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Percentage</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        placeholder="10"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                        className="bg-slate-50"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Discount percentage (0-100%)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="maxDiscount"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Discount Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="50.00"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                        className="bg-slate-50"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Maximum discount amount in EGP
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Min Purchase and Usage Limit - Side by Side */}
            <div className="grid lg:grid-cols-2 gap-4">
              <FormField
                name="minPurchase"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Purchase</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                        className="bg-slate-50"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Minimum purchase amount required
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="usageLimit"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usage Limit (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        placeholder="Unlimited"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined
                          )
                        }
                        className="bg-slate-50"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Maximum number of times code can be used
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Expiry Date Field */}
            <FormField
              name="expiredAt"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Expiry Date (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal bg-slate-50",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <Calendar className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-neutral-50" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription className="text-xs">
                    When this promo code will expire (leave empty for no expiry)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="px-4 py-3 rounded-lg text-sm text-red-600 bg-red-50 border border-red-200">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full bg-primary-gradient py-6 text-white font-medium"
            >
              {form.formState.isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {buttonText === "Add Promo Code"
                    ? "Adding..."
                    : "Updating..."}
                </span>
              ) : (
                buttonText
              )}
            </Button>
          </form>
        </FormProvider>

        {/* Info Panel */}
        <div className="flex-1 w-full lg:max-w-md">
          <div className="bg-white rounded-lg border p-6 shadow-sm sticky top-6">
            <h3 className="text-lg font-semibold mb-4">Promo Code Info</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium text-slate-700">Code Preview</p>
                <p className="text-2xl font-bold text-primary mt-1">
                  {/* eslint-disable-next-line react-hooks/incompatible-library */}
                  {form.watch("code") || "CODE"}
                </p>
              </div>
              <div className="pt-4 border-t space-y-3">
                <div>
                  <p className="font-medium text-slate-700">Discount</p>
                  <p className="text-muted-foreground">
                    {form.watch("percentage") || 0}% off (max{" "}
                    {form.watch("maxDiscount") || 0} EGP)
                  </p>
                </div>
                <div>
                  <p className="font-medium text-slate-700">Requirements</p>
                  <p className="text-muted-foreground">
                    Min purchase: {form.watch("minPurchase") || 0} EGP
                    
                  </p>
                </div>
                <div>
                  <p className="font-medium text-slate-700">Usage</p>
                  <p className="text-muted-foreground">
                    {form.watch("usageLimit")
                      ? `Limited to ${form.watch("usageLimit")} uses`
                      : "Unlimited uses"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-slate-700">Expiry</p>
                  <p className="text-muted-foreground">
                    {form.watch("expiredAt")
                      ? format(form.watch("expiredAt")!, "PPP")
                      : "No expiry date"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
