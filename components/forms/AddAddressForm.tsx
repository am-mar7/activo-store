"use client";
import { addressFormSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from "../ui/form";
import { Textarea } from "../ui/textarea";
import { Home, Loader2, MapPin, Phone, Plus } from "lucide-react";
import { Input } from "../ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useTransition } from "react";
import { addAddress } from "@/lib/server actions/addresses.action";
import { toast } from "sonner";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";

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
        form.reset();
        setShowForm(false);
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
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <MapPin className="w-4 h-4" />
                        City <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Cairo"
                          {...field}
                          className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Phone className="w-4 h-4" />
                        Phone Number <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+20 123 456 7890"
                          {...field}
                          className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Home className="w-4 h-4" />
                        Detailed Address <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="Street address, building number, apartment, floor, landmarks..."
                          {...field}
                          className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-200 outline-none transition-all resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-3 my-3">
                  <Checkbox
                    className="bg-neutral-200! border-neutral-400! "
                    id="isDefault"
                    checked={isDefault}
                    onCheckedChange={(checked) =>
                      setIsDefault(checked as boolean)
                    }
                  />
                  <Label htmlFor="terms">Set this as default address</Label>
                </div>
              </div>
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
