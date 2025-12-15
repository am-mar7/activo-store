"use client";
import { toast } from "sonner";
import Image from "next/image";
import ROUTES from "@/constants/routes";
import { signIn } from "next-auth/react";
import { Button } from "../ui/button";

export default function SocialAuthForm() {
  const handleSocialAuth = async () => {
    try {
      await signIn("google", { callbackUrl: ROUTES.HOME });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Social auth with google is not implemented yet.`
      );
    }
  };
  return (
    <div className="mt-2 w-full bg-neutral-200 rounded-lg">
      <Button
        className="px-8 flex-1 min-h-12 w-full cursor-pointer"
        onClick={() => {
          handleSocialAuth();
        }}
      >
        continue with Google
        <Image
          src="icons/google.svg"
          width={30}
          height={30}
          alt="Google logo"
          className="ml-2.5 object-contain"
        />
      </Button>
    </div>
  );
}
