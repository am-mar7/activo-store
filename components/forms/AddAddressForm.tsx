"use client";

import { addressFormSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { Form } from "../ui/form";
import { Loader2, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useTransition } from "react";
import { addAddress } from "@/lib/server actions/addresses.action";
import { toast } from "sonner";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { cn } from "@/lib/utils";
import AddressFormFields from "../address-control/AddressFormFields";

type AddressFormValues = z.infer<typeof addressFormSchema>;

interface Props {
  toggleBtn?: boolean;
  className?: string;
}

export default function AddAddressForm({
  toggleBtn = false,
  className,
}: Props) {
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    mode: "onTouched",
    defaultValues: {
      city: "",
      phone: "",
      details: "",
    },
  });

  const [showForm, setShowForm] = useState(!toggleBtn);
  const [loading, start] = useTransition();
  const [isDefault, setIsDefault] = useState<boolean>(false);

  const handleSubmit = async () => {
    start(async () => {
      const { success, error } = await addAddress({
        ...form.getValues(),
        isDefault,
      });
      if (!success) toast.error(getFriendlyErrorMessage(error));
      else {
        toast.success("Address added successfully");
        form.reset();
        setShowForm(false);
        setIsDefault(false);
      }
    });
  };

  return (
    <div className={cn(className, "flex flex-col gap-2")}>
      <button
        onClick={() => setShowForm(!showForm)}
        className="max-w-45 self-end inline-flex bg-primary-gradient items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-neutral-50 font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
      >
        {!showForm && <Plus className="w-5 h-5" />}
        {showForm ? "Discard" : "Add Address"}
      </button>

      <AnimatePresence initial={!toggleBtn}>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <Form {...form}>
              <AddressFormFields
                form={form}
                showDefaultCheckbox={true}
                isDefault={isDefault}
                onDefaultChange={setIsDefault}
              />

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full mt-6 px-3 py-2 bg-primary-600 text-neutral-50 body-medium rounded-lg hover:bg-primary-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  "Add Address"
                )}
              </button>
            </Form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}