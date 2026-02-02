import ForgetPasswordForm from "@/components/forms/ForgetPasswordForm";

export default function ForgotPassword() {
  return (
    <div className="min-h-dvh flex-center p-5">
      <div className="px-6 py-8 rounded-2xl shadow-lg w-full sm:max-w-120 bg-neutral-100">
        <ForgetPasswordForm />
      </div>
    </div>
  );
}
