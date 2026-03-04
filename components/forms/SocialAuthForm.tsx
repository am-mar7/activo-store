"use client";

import { toast } from "sonner";
import Image from "next/image";
import ROUTES from "@/constants/routes";
import { signIn } from "next-auth/react";
import { Button } from "../ui/button";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { useRouter } from "next/navigation";
import { isAndroid, isInAppBrowser } from "@/lib/utils";


export default function SocialAuthForm() {
  const router = useRouter();

  const handleSocialAuth = async () => {
    try {
      if(!isInAppBrowser()){
        await signIn("google", {
          callbackUrl: ROUTES.HOME,
        });
        return;
      }
      if (isAndroid()) {
        // Try Chrome intent
        const intentUrl =
          "intent://" +
          window.location.host +
          "#Intent;scheme=https;package=com.android.chrome;end";
    
        window.location.href = intentUrl;
    
        // Fallback after delay
        setTimeout(() => {
          router.push(ROUTES.OPENINBROWSER);
        }, 1500);
    
        return;
      }
    
      // iOS → direct fallback
      router.push(ROUTES.OPENINBROWSER);
   } catch (error) {
      toast.error(
        error instanceof Error
          ? getFriendlyErrorMessage(error)
          : "Google sign-in failed."
      );
    }
  };

  return (
    <div className="mt-2 w-full bg-neutral-200 rounded-lg">
      <Button
        type="button"
        className="px-8 flex-1 min-h-12 w-full cursor-pointer"
        onClick={handleSocialAuth}
      >
        Continue with Google
        <Image
          src="/icons/google.svg"
          width={24}
          height={24}
          alt="Google logo"
          className="ml-2.5 object-contain"
        />
      </Button>
    </div>
  );
}