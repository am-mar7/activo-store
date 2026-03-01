/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import Uploader from "@/components/Uploader";
import { appSettingsSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import z from "zod";
import { updateSettings } from "@/lib/server actions/settings.action";
import { toast } from "sonner";
import { getFriendlyErrorMessage } from "@/lib/error-messages";

const schema = appSettingsSchema.partial();

type SettingsFormValues = z.infer<typeof schema>;

type SettingsFormProps = {
  defaultValues: SettingsFormValues;
  existingHeroImage?: string;
};

export default function SettingsForm({
  defaultValues,
  existingHeroImage,
}: SettingsFormProps) {
  console.log(defaultValues);
  const [heroImageFile, setHeroImageFile] = useState<File[]>([]);
  const [existingImage, setExistingImage] = useState<string[]>(
    existingHeroImage ? [existingHeroImage] : []
  );
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues,
  });

  const router = useRouter();

  const handleSubmit = async function (data: SettingsFormValues) {
    setError(null);

    const submissionData: any = {
      ...data,
      shipping: data.shipping,
    };

    if (heroImageFile.length > 0) {
      submissionData.heroSection = {
        ...data.heroSection,
        image: heroImageFile[0],
      };
    }

    const { success, error } = await updateSettings(submissionData);

    if (success) {
      toast.success("Settings updated successfully");
      router.refresh();
    } else {
      setError(getFriendlyErrorMessage(error));
      toast.error("Failed to update settings");
    }
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="max-w-7xl space-y-6"
      >
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Shipping Settings</h2>

          <div className="space-y-4">
            <FormField
              name="shipping.cost"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shipping Cost</FormLabel>
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
                  <FormDescription>
                    Default shipping cost applied to all orders
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Hero Section</h2>

          <div className="space-y-4">
            <FormField
              name="heroSection.enabled"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Enable Hero Section
                    </FormLabel>
                    <FormDescription>
                      Show hero banner on homepage
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="bg-neutral-300"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              name="heroSection.title"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hero Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Welcome to our store"
                      {...field}
                      value={field.value}
                      className="bg-slate-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="heroSection.subtitle"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hero Subtitle</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Discover amazing products"
                      {...field}
                      value={field.value}
                      className="bg-slate-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Hero Image</FormLabel>
              <div className="mt-2">
                <Uploader
                  onImagesChange={(files: File[]) => setHeroImageFile(files)}
                  existingImageUrls={existingImage}
                  onExistingImagesChange={setExistingImage}
                  maxFiles={1}
                />
              </div>
              <FormDescription className="mt-2">
                Upload a high-quality banner image (recommended: 1920x600px)
              </FormDescription>
            </div>

            {/* CTA Button */}
            <div className="space-y-4 border-t pt-4">
              <FormLabel>Call-to-Action Button</FormLabel>

              <FormField
                name="heroSection.cta.text"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Button Text</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Shop Now"
                        {...field}
                        value={field.value}
                        className="bg-slate-50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="heroSection.cta.href"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Button Link</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="/products"
                        {...field}
                        value={field.value}
                        className="bg-slate-50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Top Banner Settings */}
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Top Banner</h2>

          <div className="space-y-4">
            <FormField
              name="topBanner.enabled"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Enable Top Banner
                    </FormLabel>
                    <FormDescription>
                      Show announcement banner at top of site
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="bg-neutral-300"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              name="topBanner.text"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banner Text</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Free shipping on orders over $50!"
                      {...field}
                      value={field.value}
                      className="bg-slate-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="topBanner.backgroundColor"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Background Color</FormLabel>
                    <FormControl>
                      <Input
                        type="color"
                        {...field}
                        value={field.value ?? "#dc2626"}
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="topBanner.textColor"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text Color</FormLabel>
                    <FormControl>
                      <Input
                        type="color"
                        {...field}
                        value={field.value ?? "#ffffff"}
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              name="topBanner.link"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banner Link (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/sale"
                      {...field}
                      value={field.value}
                      className="bg-slate-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="topBanner.startsAt"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        value={
                          field.value
                            ? new Date(field.value).toISOString().slice(0, 16)
                            : ""
                        }
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? new Date(e.target.value)
                              : undefined
                          )
                        }
                        className="bg-slate-50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="topBanner.endsAt"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        value={
                          field.value
                            ? new Date(field.value).toISOString().slice(0, 16)
                            : ""
                        }
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? new Date(e.target.value)
                              : undefined
                          )
                        }
                        className="bg-slate-50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Checkout Settings */}
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Checkout Settings</h2>

          <div className="space-y-4">
            <FormField
              name="checkout.allowCOD"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Allow Cash on Delivery
                    </FormLabel>
                    <FormDescription>Enable COD payment method</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="bg-neutral-300"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              name="checkout.allowOnlinePayment"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Allow Online Payment
                    </FormLabel>
                    <FormDescription>
                      Enable online payment methods
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="bg-neutral-300"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Maintenance Mode</h2>

          <div className="space-y-4">
            <FormField
              name="maintenance.enabled"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4 border-orange-200 bg-orange-50">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Enable Maintenance Mode
                    </FormLabel>
                    <FormDescription>
                      Site will be unavailable to customers
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="bg-neutral-300"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              name="maintenance.message"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maintenance Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="We're currently updating our site. Please check back soon!"
                      {...field}
                      value={field.value}
                      className="bg-slate-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-3 rounded-lg text-sm text-red-600 bg-red-50 border border-red-200">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 sticky bottom-0 bg-white border-t p-4 -mx-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="flex-1 bg-primary-gradient text-white"
          >
            {form.formState.isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}