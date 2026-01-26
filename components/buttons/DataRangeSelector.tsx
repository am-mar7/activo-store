"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function DateRangeSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const preset = searchParams.get("preset") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";

  const handlePresetChange = (value: string) => {
    if (value === "custom") {
      router.push(window.location.pathname);
    } else if (value) {
      const params = new URLSearchParams();
      params.set("preset", value);
      router.push(`?${params.toString()}`);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const fromValue = formData.get("from") as string;
    const toValue = formData.get("to") as string;

    if (fromValue || toValue) {
      const params = new URLSearchParams();
      if (fromValue) params.set("from", fromValue);
      if (toValue) params.set("to", toValue);
      router.push(`?${params.toString()}`);
    }
  };

  const clearFilters = () => {
    router.push(window.location.pathname);
  };

  const getPresetLabel = (preset: string) => {
    switch (preset) {
      case "day":
        return "Today";
      case "week":
        return "Last 7 Days";
      case "month":
        return "Last 30 Days";
      default:
        return preset;
    }
  };

  const sumbitButton = (
    <>
      <div className="flex gap-2">
        <Button
          type="submit"
          className="bg-gray-100 cursor-pointer"
          disabled={!!preset}
        >
          Apply
        </Button>
        {(preset || from || to) && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={clearFilters}
            title="Clear filters"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-45 space-y-2">
          <Label htmlFor="preset">Quick Select</Label>
          <div className="flex-between">
            <Select
              value={preset || "custom"}
              onValueChange={handlePresetChange}
            >
              <SelectTrigger id="preset">
                <SelectValue placeholder="Custom Range" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-50">
                <SelectItem value="custom">Custom Range</SelectItem>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
            <div className="hidden 2xl:block">{sumbitButton}</div>
          </div>
        </div>

        <div className="flex-1 min-w-45 space-y-2">
          <Label htmlFor="from">From</Label>
          <div className="relative">
            <Input
              type="date"
              id="from"
              name="from"
              defaultValue={from}
              disabled={!!preset}
              className="pr-10"
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <div className="flex-1 min-w-45 space-y-2">
          <Label htmlFor="to">To</Label>
          <div className="relative">
            <Input
              type="date"
              id="to"
              name="to"
              defaultValue={to}
              disabled={!!preset}
              className="pr-10"
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <div className="2xl:hidden">{sumbitButton}</div>
      </form>

      {(preset || from || to) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground">
              Active Filter:
            </span>
            {preset ? (
              <Badge variant="default" className="gap-1">
                <Calendar className="h-3 w-3" />
                {getPresetLabel(preset)}
              </Badge>
            ) : (
              from && (
                <Badge variant="secondary" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  {from} {to && `→ ${to}`}
                </Badge>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
