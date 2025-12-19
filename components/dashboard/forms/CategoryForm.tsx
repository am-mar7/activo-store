"use client";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Uploader from "@/components/Uploader";
import { DASHBOARDROUTES } from "@/constants/routes";
import { addCatergory } from "@/lib/server actions/category.action";
import { CategorySchema } from "@/lib/validation";
import { CategoryType } from "@/types/global";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const schema = CategorySchema.omit({
  isActive: true,
  image: true,
  slug: true,
});
type categoryOption = Pick<CategoryType, "_id" | "name">;
type CategoryFromValues = z.infer<typeof schema>;

type CategoryFromType = {
  defaultValues: CategoryFromValues;
  formType: "ADD" | "EDIT";
  categories: categoryOption[];
};

export default function CategoryForm({
  defaultValues,
  formType,
  categories,
}: CategoryFromType) {
  const form = useForm<CategoryFromValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues,
  });
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [imagesError, setImagesError] = useState<string | null>(null);
  const router = useRouter();

  const generateSlug = function (text: string): string {
    return text
      .toLowerCase()
      .replace(/'/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
      .replace(/^-+|-+$/g, "");
  };

  const handleSubmit = async () => {
    const slug = generateSlug(form.getValues().name);
    console.log(form.getValues(), slug, files[0]);
    if (files.length === 0) {
      setImagesError("you must add image");
      return;
    }
    const params = {
      name: form.getValues().name,
      parentId:
        form.getValues().parentId === "none"
          ? undefined
          : form.getValues().parentId,
      image: files[0],
      slug,
      isActive: true,
    };
    const { success, error } = await addCatergory(params);
    if (success) {
      router.push(DASHBOARDROUTES.CATEGORY);
      toast.success("Category added successfully");
    } else {
      setError(
        error?.message ||
          "An error occurred while adding the product. Please try again."
      );
    }
  };

  const buttonText = formType === "ADD" ? "Add Category" : "Update Category";

  return (
    <div className="space-y-3 max-w-7xl">
      {" "}
      <div className="flex flex-col lg:flex-row gap-8  mx-auto py-5">
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex-1 space-y-6 bg-white rounded-lg border p-6 shadow-sm"
          >
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">
                {formType === "ADD" ? "Add New Category" : "Edit Category"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Fill in the category details below
              </p>
            </div>
            {/* name field */}
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Category name"
                      {...field}
                      className="bg-slate-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categories Field with Tags */}
            <FormField
              name="parentId"
              control={form.control}
              render={() => (
                <FormItem>
                  <FormLabel>Categories</FormLabel>
                  <Select>
                    <FormControl>
                      <SelectTrigger className="bg-slate-50">
                        <SelectValue placeholder="Select categories" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="z-2 bg-slate-50">
                      <SelectItem value="none">
                        <span className="text-muted-foreground">None</span>
                      </SelectItem>
                      {categories.map((category) => (
                        <SelectItem
                          key={category._id}
                          value={category._id}
                          disabled={form.getValues().parentId === category._id}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs">
                    Select only one category to be the parent of this category
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="h-9/24 flex flex-col gap-3 justify-end">
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
                    {buttonText === "Add Category"
                      ? "Adding..."
                      : "Updating..."}
                  </span>
                ) : (
                  buttonText
                )}
              </Button>
            </div>
          </form>
        </FormProvider>

        <div className="flex-1 w-full lg:max-w-md">
          <div
            className={`bg-white rounded-lg border p-6 shadow-sm sticky top-6 ${
              imagesError ? "border-destructive border-dotted" : ""
            }`}
          >
            <h3 className="text-lg font-semibold mb-4">Category Image</h3>
            <Uploader
              initialImages={files}
              onImagesChange={(files: File[]) => {
                setFiles(files);
                setImagesError(null);
              }}
              maxFiles={1}
              maxSizePerFile={1}
            />
            <p className="text-xs text-muted-foreground mt-3">
              Upload high-quality image of your category
            </p>
            {imagesError && (
              <p className="text-red-600 text-xs mt-4">{imagesError}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
