"use client";

import { IAddress } from "@/models/user.model";
import { useState, forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addressFormSchema } from "@/lib/validation";
import { Form } from "@/components/ui/form";
import SavedAddressList from "./SavedAddressList";
import AddressFormFields from "./AddressFormFields";

type AddressFormValues = z.infer<typeof addressFormSchema>;

export type AddressData = {
  address: {
    city: string;
    phone: string;
    details: string;
  };
  isDefault: boolean;
  isExisting: boolean;
};

interface AddressSelectorProps {
  savedAddresses: IAddress[];
  showDefaultCheckbox?: boolean;
}

export interface AddressSelectorHandle {
  getAddressData: () => Promise<AddressData | null>;
}

const AddressSelector = forwardRef<AddressSelectorHandle, AddressSelectorProps>(
  ({ savedAddresses, showDefaultCheckbox = true }, ref) => {
    const [useExistingAddress, setUseExistingAddress] = useState(
      savedAddresses.length > 0
    );
    const [selectedAddressIndex, setSelectedAddressIndex] = useState(() => {
      const defaultIndex = savedAddresses.findIndex((addr) => addr.isDefault);
      return Math.max(defaultIndex, 0);
    });
    const [setAsDefault, setSetAsDefault] = useState(
      savedAddresses.length > 0 ? false : true
    );

    const form = useForm<AddressFormValues>({
      resolver: zodResolver(addressFormSchema),
      mode: "onTouched",
      defaultValues: {
        city: "",
        phone: "",
        details: "",
      },
    });

    useImperativeHandle(ref, () => ({
      getAddressData: async (): Promise<AddressData | null> => {
        if (useExistingAddress) {
          const selectedAddress = savedAddresses[selectedAddressIndex];
          return {
            address: {
              city: selectedAddress.city,
              phone: selectedAddress.phone,
              details: selectedAddress.details,
            },
            isDefault: setAsDefault,
            isExisting: true,
          };
        } else {
          const isValid = await form.trigger();
          if (!isValid) return null;

          return {
            address: {
              city: form.getValues("city"),
              phone: form.getValues("phone"),
              details: form.getValues("details"),
            },
            isDefault: setAsDefault,
            isExisting: false,
          };
        }
      },
    }));

    return (
      <div className="space-y-4">
        {savedAddresses.length > 0 && (
          <div className="mb-6">
            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={useExistingAddress}
                onChange={(e) => {
                  setUseExistingAddress(e.target.checked);
                  if (!e.target.checked) {
                    setSetAsDefault(true);
                  }
                }}
                className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-slate-700">
                Use saved address
              </span>
            </label>

            {useExistingAddress && (
              <SavedAddressList
                addresses={savedAddresses}
                selectedIndex={selectedAddressIndex}
                onSelect={setSelectedAddressIndex}
              />
            )}
          </div>
        )}

        {(!useExistingAddress || savedAddresses.length === 0) && (
          <Form {...form}>
            <AddressFormFields
              form={form}
              showDefaultCheckbox={
                showDefaultCheckbox && savedAddresses.length > 0
              }
              isDefault={setAsDefault}
              onDefaultChange={setSetAsDefault}
            />
          </Form>
        )}

        {useExistingAddress &&
          savedAddresses.length > 0 &&
          showDefaultCheckbox && (
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="setAsDefault"
                checked={setAsDefault}
                onChange={(e) => setSetAsDefault(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-2 focus:ring-primary-500"
              />
              <label
                htmlFor="setAsDefault"
                className="text-sm text-slate-700 cursor-pointer"
              >
                Set this as default address
              </label>
            </div>
          )}
      </div>
    );
  }
);

AddressSelector.displayName = "AddressSelector";

export default AddressSelector;