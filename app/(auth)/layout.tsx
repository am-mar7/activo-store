import SocialAuthForm from "@/components/forms/SocialAuthForm";
import Image from "next/image";
import React from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="min-h-dvh flex-center p-5">
        <section className="px-6 py-8 rounded-2xl shadow-lg w-full sm:max-w-140 bg-neutral-100">
          <div className="flex-between max-h-18 overflow-hidden">
            <div className="w-full">
              <h2 className="h2-bold">Join Activo</h2>
              <h4 className="text-light-400 body-regular">
                Your perfect fit is just a sign-in away
              </h4>
            </div>
            <Image
              src="/images/site-logo.png"
              alt="Activo Logo"
              width={160}
              height={40}
              className="object-contain"
            />
          </div>
          {children}

          <div className="relative flex items-center py-4">
            <div className="grow h-px bg-linear-to-r from-neutral-100 via-neutral-300 to-neutral-400"></div>
            <span className="mx-4 shrink text-sm font-medium text-neutral-600 dark:text-neutral-400">
              or
            </span>
            <div className="grow h-px bg-linear-to-r from-neutral-400 via-neutral-300 to-neutral-100"></div>
          </div>

          <SocialAuthForm />
        </section>
      </main>
    </>
  );
}
