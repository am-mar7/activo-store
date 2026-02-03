import ForgetPasswordForm from "@/components/forms/ForgetPasswordForm";
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Activo Store | Forgot Password',
  description: 'Reset your Activo Store account password. Enter your email to receive password reset instructions.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://activo-store.vercel.app.com/forgot-password',
  },
}

export default function ForgotPassword() {
  return (
    <div className="min-h-dvh flex-center p-5">
      <div className="px-6 py-8 rounded-2xl shadow-lg w-full sm:max-w-120 bg-neutral-100">
        <ForgetPasswordForm />
      </div>
    </div>
  );
}
