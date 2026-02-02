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
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/server actions/auth.action";
import { ActionResponse } from "@/types/global";
import { getFriendlyErrorMessage } from "@/lib/error-messages";

const ResetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof ResetPasswordSchema>;

export default function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTokenError("missing reset token. Please request a new password reset link.");
    }
  }, [token]);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      setError("Invalid reset token");
      return;
    }

    setError(null);

    const result = (await resetPassword({
      token,
      password: values.password,
    })) as ActionResponse;

    if (result.success) {
      toast.success("Password reset successfully!", {
        duration: 3000,
      });
      router.push(ROUTES.SIGN_IN);
    } else {
      setError(getFriendlyErrorMessage(result.error));
    }
  };

  if (tokenError) {
    return (
      <div className="space-y-6 mt-8">
        <p className="px-4 py-2 rounded-lg text-red-500 bg-red-100">
          {tokenError}
        </p>
        <div className="text-center space-y-4">
          <Link 
            href={ROUTES.FORGOT_PASSWORD}
            className="inline-block text-primary-gradient hover:underline"
          >
            Request a new password reset link
          </Link>
          <p>
            <Link className="text-primary-gradient" href={ROUTES.SIGN_IN}>
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 mt-8"
      >
        <div className="text-center mb-6">
          <p className="text-light-400 body-regular">
            Enter your new password below
          </p>
        </div>

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="paragraph-medium">New Password</FormLabel>
              <FormControl>
                <Input
                  required
                  type="password"
                  placeholder="Enter new password"
                  {...field}
                  className="px-3 py-2 bg-slate-50! border-slate-300!"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="paragraph-medium">Confirm Password</FormLabel>
              <FormControl>
                <Input
                  required
                  type="password"
                  placeholder="Confirm new password"
                  {...field}
                  className="px-3 py-2 bg-slate-50! border-slate-300!"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <p className="px-4 py-2 rounded-lg text-red-500 bg-red-100">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className={`w-full bg-primary-gradient py-5 text-slate-50 ${
            form.formState.isSubmitting ? "opacity-40" : ""
          }`}
        >
          {form.formState.isSubmitting
            ? "Resetting..."
            : "Reset Password"}
        </Button>

        <p className="text-center">
          <Link className="text-primary-gradient" href={ROUTES.SIGN_IN}>
            Back to Sign In
          </Link>
        </p>
      </form>
    </Form>
  );
}