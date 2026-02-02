"use client";

import { IAddress } from "@/models/user.model";
import { MapPin, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SavedAddressListProps {
  addresses: IAddress[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export default function SavedAddressList({
  addresses,
  selectedIndex,
  onSelect,
}: SavedAddressListProps) {
  if (addresses.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p className="text-sm">No saved addresses yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {addresses.map((address, index) => (
        <label
          key={index}
          className={`flex items-start gap-3 p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-primary-300 ${
            selectedIndex === index
              ? "border-primary-600 bg-primary-50"
              : "border-slate-200"
          }`}
        >
          <input
            type="radio"
            name="savedAddress"
            checked={selectedIndex === index}
            onChange={() => onSelect(index)}
            className="mt-1 w-4 h-4 text-primary-600 border-slate-300 focus:ring-2 focus:ring-primary-500"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="font-medium text-slate-900 text-sm sm:text-base">
                {address.city}
              </span>
              {address.isDefault && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-primary-100 text-primary-700 border-primary-200"
                >
                  Default
                </Badge>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 ml-6 mb-1">
              {address.details}
            </p>

            <div className="flex items-center gap-2 ml-6">
              <Phone className="w-3 h-3 text-slate-400" />
              <span className="text-xs sm:text-sm text-slate-500">
                {address.phone}
              </span>
            </div>
          </div>
        </label>
      ))}
    </div>
  );
}