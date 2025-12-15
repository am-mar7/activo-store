import AuthForm from "@/components/forms/AuthForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Activo | Signin"
}

export default function SignIn() {
  return (
    <AuthForm
      defaultValues={{ email: "", password: "" }}
      formType="SIGN_IN"
    />
  );
}
