import AuthForm from "@/components/forms/AuthForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Activo | Signup"
}

export default function SignUp() {
  return (
    <AuthForm
      defaultValues={{ name: "", email: "", password: "" }}
      formType="SIGN_UP"
    />
  );
}
