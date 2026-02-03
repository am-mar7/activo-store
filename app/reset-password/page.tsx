import ResetPasswordForm from "@/components/forms/ResetPasswordForm";
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Activo Store | Reset Password',
  description: 'Create a new password for your Activo Store account.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://activo-store.vercel.app.com/reset-password',
  },
}

export default function ResetPassword() {
  return (
    <div className="min-h-dvh flex-center p-5">
      <div className="px-6 py-8 rounded-2xl shadow-lg w-full sm:max-w-120 bg-neutral-100">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
