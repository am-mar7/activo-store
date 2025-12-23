"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, X } from "lucide-react";
import { sizes, colors } from "@/constants";
import { toast } from "sonner";

interface IVariant {
  sku: string;
  color?: string;
  size?: string;
  stock: number;
  image?: string;
}

interface VariantBuilderProps {
  variants?: IVariant[];
  productTitle: string;
  onVariantsChanged: (variants: IVariant[]) => void;
}

export default function VariantBuilder({
  variants = [],
  productTitle,
  onVariantsChanged,
}: VariantBuilderProps) {
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [showStockTable, setShowStockTable] = useState(false);
  const [stockData, setStockData] = useState<
    Record<string, Record<string, number>>
  >({});
  const [isShoes, setIsShoes] = useState(false);

  const [lastGeneratedTitle, setLastGeneratedTitle] =
    useState<string>(productTitle);
  const [startSize, setStartSize] = useState<string>("");
  const [endSize, setEndSize] = useState<string>("");

  const generateShoeSizes = () => {
    const start = parseFloat(startSize);
    const end = parseFloat(endSize);

    if (isNaN(start) || isNaN(end) || start >= end) {
      toast.error("Invalid range");
      return;
    }

    const range: string[] = [];
    for (let i = start; i <= end; i += 1) range.push(i.toString());

    setSelectedSizes(range);
  };

  const toggleSize = (size: string) => {
    if (isShoes) return;
    selectedColors.forEach((color) => {
      updateStock(color, size, 0);
    });
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const addColor = (color: string) => {
    if (!selectedColors.includes(color)) {
      setSelectedColors((prev) => [...prev, color]);
    }
  };

  const removeColor = (color: string) => {
    setSelectedColors((prev) => prev.filter((c) => c !== color));
    selectedSizes.forEach((size) => {
      updateStock(color, size, 0);
    });
  };

  const generateSKU = (title: string, size: string, color: string): string => {
    const titlePart = title
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 4)
      .toUpperCase();
    const sizePart = size.toUpperCase();
    const colorPart = color.substring(0, 3).toUpperCase();
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `${titlePart}-${sizePart}-${colorPart}-${randomPart}`;
  };

  const handleFillStock = () => {
    // Initialize stock data structure
    initializeFromVariants();
    setShowStockTable(true);
  };

  const updateStock = (color: string, size: string, value: number) => {
    setStockData((prev) => ({
      ...prev,
      [color]: {
        ...prev[color],
        [size]: value,
      },
    }));
  };

  const handleSubmit = () => {
    const variants: IVariant[] = [];

    selectedColors.forEach((color) => {
      selectedSizes.forEach((size) => {
        const stock = stockData[color]?.[size] || 0;
        variants.push({
          sku: generateSKU(productTitle, size, color),
          color,
          size,
          stock,
        });
      });
    });

    onVariantsChanged(variants);
    console.log("Generated Variants:", variants);
    setShowStockTable(false);
    toast.success("Product stocks saved successfully!");
  };

  const getColorFromConstant = (colorValue: string) => {
    return colors.find((c) => c.value === colorValue);
  };

  const initializeFromVariants = () => {
    if (variants.length === 0) {
      const initialStock: Record<string, Record<string, number>> = {};
      selectedColors.forEach((color) => {
        initialStock[color] = {};
        selectedSizes.forEach((size) => {
          initialStock[color][size] = 0;
        });
      });
      setStockData(initialStock);
      return;
    }

    const sizes = new Set<string>();
    const colors = new Set<string>();
    const stocks: Record<string, Record<string, number>> = {};

    variants.forEach((variant) => {
      if (variant.size) sizes.add(variant.size);
      if (variant.color) {
        colors.add(variant.color);
        if (!stocks[variant.color]) {
          stocks[variant.color] = {};
        }
        if (variant.size) {
          stocks[variant.color][variant.size] = variant.stock;
        }
      }
    });

    setSelectedSizes(Array.from(sizes));
    setSelectedColors(Array.from(colors));
    setStockData(stocks);
  };

  useEffect(() => {
    if (variants.length === 0 || productTitle.trim() === "") {
      return;
    }

    if (productTitle === lastGeneratedTitle) {
      return;
    }

    const debounceTimer = setTimeout(() => {
      const titlePrefix = productTitle
        .replace(/[^a-zA-Z0-9]/g, "")
        .substring(0, 4)
        .toUpperCase();

      const existingTitlePrefix = variants[0]?.sku.split("-")[0] || "";

      if (titlePrefix !== existingTitlePrefix && titlePrefix !== "") {
        const updatedVariants = variants.map((variant) => ({
          ...variant,
          sku: generateSKU(
            productTitle,
            variant.size || "",
            variant.color || ""
          ),
        }));

        onVariantsChanged(updatedVariants);
        setLastGeneratedTitle(productTitle);
        toast.info("SKUs updated to match new title");
      }
    }, 1000);
    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productTitle]);
  useEffect(() => {
    variants.forEach((variant) => {
      if (variant.color)
        setSelectedColors((prev) => [
          ...new Set([...prev, ...(variant.color ? [variant.color] : [])]),
        ]);
      setSelectedSizes((prev) => [
        ...new Set([...prev, ...(variant.size ? [variant.size] : [])]),
      ]);
    });
  }, [variants]);

  return (
    <div className="space-y-6 bg-white rounded-lg border p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold mb-2">Product Variants</h3>
        <p className="text-sm text-muted-foreground">
          Select sizes and colors to create product variants
        </p>
      </div>

      {/* Size Selection */}
      <div>
        <label className="text-sm font-medium mb-3 block">
          Select Sizes <span className="text-red-500">*</span>
        </label>
        <div className="items-center gap-2 mb-3">
          <Input
            type="checkbox"
            id="isShoes"
            checked={isShoes}
            onChange={(e) => setIsShoes(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
          />
          <label
            htmlFor="isShoes"
            className="text-sm font-medium cursor-pointer select-none"
          >
            This product is shoes (uses shoe sizes)
          </label>
        </div>
        <div className={`flex flex-wrap gap-2 }`}>
          {sizes.map((size) => (
            <Badge
              key={size.value}
              variant={
                selectedSizes.includes(size.value) ? "default" : "outline"
              }
              aria-description="Click to select size"
              aria-disabled={isShoes}
              className={`cursor-pointer px-4 py-2 text-sm transition-all ${
                isShoes ? "hidden" : ""
              } ${
                selectedSizes.includes(size.value)
                  ? "bg-primary-gradient text-white"
                  : "bg-slate-50 hover:bg-slate-100"
              }`}
              onClick={() => toggleSize(size.value)}
            >
              {selectedSizes.includes(size.value) && (
                <Check className="h-3 w-3 mr-1" />
              )}
              {size.label}
            </Badge>
          ))}
        </div>
        {selectedSizes.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            {selectedSizes.length} size(s) selected
          </p>
        )}
        {/* Shoe Size Range Inputs */}
        {isShoes && (
          <div className="space-y-2">
            <label className="text-sm font-medium block">
              Shoe Size Range <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                step="1"
                placeholder="35"
                value={startSize}
                onChange={(e) => setStartSize(e.target.value)}
                className="bg-slate-50 w-18"
              />
              <Input
                type="number"
                step="1"
                placeholder="45"
                value={endSize}
                onChange={(e) => setEndSize(e.target.value)}
                className="bg-slate-50 w-18"
              />
              <Button
                type="button"
                onClick={generateShoeSizes}
                variant="outline"
              >
                Generate
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Color Selection */}
      <div>
        <label className="text-sm font-medium mb-3 block">
          Select Colors <span className="text-red-500">*</span>
        </label>
        <Select value="" onValueChange={addColor}>
          <SelectTrigger className="bg-slate-50">
            <SelectValue placeholder="Add colors" />
          </SelectTrigger>
          <SelectContent className="z-2 bg-neutral-50">
            {colors.map((color) => (
              <SelectItem
                key={color.value}
                value={color.value}
                disabled={selectedColors.includes(color.value)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-4 w-4 rounded-full border"
                    style={{ backgroundColor: color.hex }}
                  />
                  {color.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Selected Colors Tags */}
        {selectedColors.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedColors.map((colorValue) => {
              const color = getColorFromConstant(colorValue);
              return (
                <Badge
                  key={colorValue}
                  variant="secondary"
                  className="px-3 py-1.5 text-sm"
                >
                  <div
                    className="h-3 w-3 rounded-full border mr-2"
                    style={{ backgroundColor: color?.hex }}
                  />
                  {color?.label}
                  <button
                    type="button"
                    onClick={() => removeColor(colorValue)}
                    className="ml-2 hover:text-destructive focus:outline-none"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      {/* Fill Stock Button */}
      {!showStockTable && (
        <Button
          type="button"
          onClick={handleFillStock}
          className="w-full"
          variant="outline"
        >
          show stock table
        </Button>
      )}

      {/* Stock Table */}
      {showStockTable && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Stock Table</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowStockTable(false)}
            >
              cancel
            </Button>
          </div>

          <div className="space-y-4">
            {selectedColors.map((colorValue) => {
              const color = getColorFromConstant(colorValue);
              return (
                <div
                  key={colorValue}
                  className="border rounded-lg p-4 bg-slate-50"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="h-5 w-5 rounded-full border-2 border-white shadow"
                      style={{ backgroundColor: color?.hex }}
                    />
                    <span className="text-sm font-semibold">
                      {color?.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 2xl:grid-cols-12 gap-3">
                    {selectedSizes.map((size) => (
                      <div key={size} className="space-y-1">
                        <label className="text-xs font-medium text-gray-600 uppercase">
                          {size}
                        </label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={stockData[colorValue]?.[size] || ""}
                          onChange={(e) =>
                            updateStock(
                              colorValue,
                              size,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="text-center bg-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <Button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-primary-gradient text-neutral-50"
          >
            Save Stock table
          </Button>
        </div>
      )}
    </div>
  );
}
