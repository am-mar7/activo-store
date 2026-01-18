"use client";

import { Star } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { setAddressAsDefault } from "@/lib/server actions/addresses.action";

interface SetDefaultAddressBtnProps {
  addressId: string;
}

export default function SetDefaultAddressBtn({
  addressId,
}: SetDefaultAddressBtnProps) {
  const [pending, start] = useTransition();

  const handleSetDefault = () => {
    start(async () => {
      const { success, error } = await setAddressAsDefault(addressId);

      if (!success) toast.error(getFriendlyErrorMessage(error));
    });
  };

  return (
    <button
      onClick={handleSetDefault}
      disabled={pending}
      className="flex-1 px-4 py-2 body-medium rounded-lg bg-primary-gradient hover:bg-primary/90 active:bg-primary/80 text-white transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex-center gap-2"
    >
      {pending ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Setting...
        </>
      ) : (
        <>
          <Star className="w-4 h-4" />
          Set as Default
        </>
      )}
    </button>
  );
}
