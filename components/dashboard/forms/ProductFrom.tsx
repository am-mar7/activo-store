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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Uploader from "@/components/Uploader";
import { ProductSchema } from "@/lib/validation";
import { CategoryType } from "@/types/global";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { X } from "lucide-react";
import z from "zod";
import { addProduct } from "@/lib/server actions/product.action";
import VariantBuilder from "../VariantBuilder";
import { IVariant } from "@/models/product.model";
import { DASHBOARDROUTES } from "@/constants/routes";
import { toast } from "sonner";

const schema = ProductSchema.omit({
  images: true,
  isActive: true,
  variants: true,
});
type ProductFormValues = z.infer<typeof schema>;

type categoryOption = Pick<CategoryType, "_id" | "name">;

type ProductFromType = {
  defaultValues: ProductFormValues;
  formType: "ADD" | "EDIT";
  categories: categoryOption[];
};

export default function ProductFrom({
  defaultValues,
  formType,
  categories,
}: ProductFromType) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [variants, setVariant] = useState<IVariant[]>([]);
  const [imagesError, setImagesError] = useState<string | null>(null);
  const [variantsError, setVariantsError] = useState<string | null>(null);
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues,
  });

  const router = useRouter();

  const handleSubmit = async function (data: ProductFormValues) {
    // Submit logic here
    console.log("Submitting form with data:", data, files, variants);

    if (files.length === 0) {
      setImagesError("At least one image is required");
      return;
    }
    if (variants.length === 0) {
      setVariantsError("please fill the stock table");
      return;
    }
    console.log(data, files, variants);
    const { success, error } = await addProduct({
      ...data,
      images: files,
      variants,
    });
    if (success) {
      router.push(DASHBOARDROUTES.PRODUCTS);
      toast.success("Product added successfully");
    } else {
      setError(
        error?.message ||
          "An error occurred while adding the product. Please try again."
      );
    }
  };

  const buttonText = formType === "ADD" ? "Add Product" : "Update Product";

  const removeCategory = (categoryId: string) => {
    const currentCategories = form.getValues("category");
    form.setValue(
      "category",
      currentCategories.filter((id) => id !== categoryId)
    );
  };

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedCategories = form.watch("category") || [];

  const getSelectedCategoryNames = () => {
    return categories.filter((cat) => selectedCategories.includes(cat._id));
  };

  const currentTitle = form.watch("title");
  return (
    <div className="space-y-3 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-8  mx-auto py-5">
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex-1 space-y-6 bg-white rounded-lg border p-6 shadow-sm"
          >
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">
                {formType === "ADD" ? "Add New Product" : "Edit Product"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Fill in the product details below
              </p>
            </div>

            {/* Title Field */}
            <FormField
              name="title"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter product title"
                      {...field}
                      className="bg-slate-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter product description"
                      className="bg-slate-50 min-h-25 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price Fields - Side by Side */}
            <div className="grid lg:grid-cols-2 gap-4">
              <FormField
                name="newPrice"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
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
                      set the base price for the product
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="oldPrice"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compare at Price (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseFloat(e.target.value)
                              : undefined
                          )
                        }
                        className="bg-slate-50"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Show a discount by setting a higher compare price
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Collection Field */}
            <FormField
              name="collection"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collection</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-slate-50">
                        <SelectValue placeholder="Select a collection" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="z-2 bg-slate-50">
                      <SelectItem value="winter">Winter Collection</SelectItem>
                      <SelectItem value="summer">Summer Collection</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categories Field with Tags */}
            <FormField
              name="category"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categories</FormLabel>
                  <Select
                    value=""
                    onValueChange={(value) => {
                      const currentCategories = field.value || [];
                      if (!currentCategories.includes(value)) {
                        field.onChange([...currentCategories, value]);
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-slate-50">
                        <SelectValue placeholder="Select categories" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="z-2 bg-slate-50">
                      {categories.map((category) => (
                        <SelectItem
                          key={category._id}
                          value={category._id}
                          disabled={selectedCategories.includes(category._id)}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs">
                    Select one or more categories for this product
                  </FormDescription>

                  {/* Selected Categories Tags */}
                  {selectedCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {getSelectedCategoryNames().map((category) => (
                        <Badge
                          key={category._id}
                          variant="secondary"
                          className="px-3 py-1.5 text-sm"
                        >
                          {category.name}
                          <button
                            type="button"
                            onClick={() => removeCategory(category._id)}
                            className="ml-2 hover:text-destructive focus:outline-none"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
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
                  {buttonText === "Add Product" ? "Adding..." : "Updating..."}
                </span>
              ) : (
                buttonText
              )}
            </Button>
          </form>
        </FormProvider>

        {/* Image Upload Section */}
        <div className="flex-1 w-full lg:max-w-md">
          <div
            className={`bg-white rounded-lg border p-6 shadow-sm sticky top-6 ${
              imagesError ? "border-destructive border-dotted" : ""
            }`}
          >
            <h3 className="text-lg font-semibold mb-4">Product Images</h3>
            <Uploader
              initialImages={files}
              onImagesChange={(files: File[]) => {
                setFiles(files);
                setImagesError(null);
              }}
            />
            <p className="text-xs text-muted-foreground mt-3">
              Upload high-quality images of your product. First image will be
              the main product image.
            </p>
            {imagesError && (
              <p className="text-red-600 text-xs mt-4">{imagesError}</p>
            )}
          </div>
        </div>
      </div>
      <div
        className={`w-full ${
          variantsError ? "border border-dotted border-destructive" : ""
        }`}
      >
        <VariantBuilder
          variants={variants}
          onVariantsChanged={(variants: IVariant[]) => {
            setVariant(variants);
            setVariantsError(null);
          }}
          productTitle={currentTitle}
        />
        {variantsError && (
          <p className="text-red-600 text-sm my-2 px-2">{variantsError}</p>
        )}
      </div>
    </div>
  );
}
