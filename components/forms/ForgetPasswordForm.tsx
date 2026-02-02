"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import ROUTES from "@/constants/routes";
import { toast } from "sonner";
import { useState } from "react";
import { sendPasswordResetEmail } from "@/lib/server actions/auth.action";
import { ActionResponse } from "@/types/global";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { ForgotPasswordSchema } from "@/lib/validation";

type ForgotPasswordFormValues = z.infer<typeof ForgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = async (values: ForgotPasswordFormValues) => {
    setError(null);
    setSuccess(false);

    const result = (await sendPasswordResetEmail(
      values.email
    )) as ActionResponse;

    if (result.success) {
      setSuccess(true);
      toast.success("Password reset email sent! Check your inbox.", {
        duration: 5000,
      });
    } else {
      setError(getFriendlyErrorMessage(result.error));
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 mt-8"
      >
        <div className="text-center mb-6">
          <p className="text-light-400 body-regular">
            Enter your email address and we&apos;ll send you a link to reset
            your password
          </p>
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="paragraph-medium">Email</FormLabel>
              <FormControl>
                <Input
                  required
                  type="email"
                  placeholder="your@email.com"
                  {...field}
                  className="px-3 py-2 bg-slate-50! border-slate-300!"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <p className="px-4 py-2 rounded-lg text-red-800 bg-red-50">
            {error}
          </p>
        )}

        {success && (
          <p className="px-4 py-2 rounded-lg text-green-800 bg-green-50">
            Password reset email sent! Check your inbox.
          </p>
        )}

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className={`w-full bg-primary-gradient py-5 text-slate-50 ${
            form.formState.isSubmitting ? "opacity-40" : ""
          }`}
        >
          {form.formState.isSubmitting ? "Sending..." : "Send Reset Link"}
        </Button>

        <p className="text-center">
          Remember your password?{" "}
          <Link className="text-primary-600" href={ROUTES.SIGN_IN}>
            Sign in
          </Link>
        </p>
      </form>
    </Form>
  );
}
