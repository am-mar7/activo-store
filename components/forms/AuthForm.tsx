"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DefaultValues, FieldValues, useForm } from "react-hook-form";
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
import { SignInSchema, SignUpSchema } from "@/lib/validation";
import {
  credentialsSignIn,
  credentialsSignUp,
} from "@/lib/server actions/auth.action";
import { ActionResponse } from "@/types/global";
import { toast } from "sonner";
import { useState } from "react";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

type AuthFromType<T extends FieldValues> = {
  defaultValues: T;
  formType: "SIGN_IN" | "SIGN_UP";
};
export default function AuthForm<T extends FieldValues>({
  defaultValues,
  formType,
}: AuthFromType<T>) {
  const formSchema: typeof SignInSchema | typeof SignUpSchema =
    formType === "SIGN_IN" ? SignInSchema : SignUpSchema;
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues as DefaultValues<T>,
  });
  const router = useRouter();

  const handleSubmit = async function () {
    const onSubmit =
      formType === "SIGN_IN" ? credentialsSignIn : credentialsSignUp;
    const result = (await onSubmit(form.getValues())) as ActionResponse;
    const successMSG =
      formType === "SIGN_IN"
        ? "You have signed in successfully"
        : "You have created Account successfully";

    if (result.success) {
      toast.success(successMSG, {
        duration: 3000,
      });
      router.push(ROUTES.HOME);
    } else {
      setError(getFriendlyErrorMessage(result.error));
    }
  };

  const buttonText = formType === "SIGN_IN" ? "Sign In" : "Sign Up";

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 mt-8"
      >
        {Object.keys(defaultValues).map((field, idx) => {
          const isPasswordField = field === "password";
          
          return (
            <FormField
              key={idx}
              control={form.control}
              name={field as "email" | "password"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="paragraph-medium">
                    {field.name.charAt(0).toUpperCase() + field.name.slice(1)}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        required
                        type={
                          isPasswordField
                            ? showPassword
                              ? "text"
                              : "password"
                            : "text"
                        }
                        {...field}
                        className="px-3 py-2 bg-slate-50! border-slate-300! pr-10"
                      />
                      {isPasswordField && (
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        })}
        
        <p>
          {formType === "SIGN_IN"
            ? "Don't have account ? "
            : "Already have account ? "}
          {formType === "SIGN_IN" ? (
            <Link className="text-primary-600" href={ROUTES.SIGN_UP}>
              sign up
            </Link>
          ) : (
            <Link className="text-primary-600" href={ROUTES.SIGN_IN}>
              sign in
            </Link>
          )}
        </p>

        {formType === "SIGN_IN" && (
          <div className="mb-3">
            <Link className="text-primary-600" href={ROUTES.FORGOT_PASSWORD}>
              forget password?
            </Link>
          </div>
        )}

        {error && (
          <p className="px-4 py-2 rounded-lg text-red-500 bg-red-100">
            {error}
          </p>
        )}

        <Button
          type="submit"
          className={`w-full bg-primary-gradient py-5 text-slate-50 ${
            form.formState.isSubmitting ? "opacity-40" : ""
          }`}
        >
          {form.formState.isSubmitting
            ? buttonText === "Sign In"
              ? "Signing in..."
              : "Creating account..."
            : buttonText === "Sign In"
            ? "Sign In"
            : "Sign Up"}
        </Button>
      </form>
    </Form>
  );
}