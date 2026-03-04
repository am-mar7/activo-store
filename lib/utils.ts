import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import config from "./config";
import {
  ActionResponse,
  ErrorResponse,
  UploadedImageData,
} from "../types/global";
import handleError from "./handlers/error";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCurrentSeason(): "summer" | "winter" {
  const month = new Date().getMonth(); // 0-11

  // Spring/Summer: March (2) to August (7)
  // Fall/Winter: September (8) to February (1)
  if (month >= 2 && month <= 7) {
    return "summer";
  }

  return "winter";
}

export const handleUpload = async (
  file: File
): Promise<ActionResponse<UploadedImageData>> => {
  if (!file) {
    return handleError(new Error("No file provided")) as ErrorResponse;
  }

  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const maxSize = 5 * 1024 * 1024;

  if (!validTypes.includes(file.type)) {
    return handleError(
      new Error(`Invalid file type. Allowed types: ${validTypes.join(", ")}`)
    ) as ErrorResponse;
  }

  if (file.size > maxSize) {
    return handleError(
      new Error(`File size exceeds ${maxSize / 1024 / 1024}MB limit`)
    ) as ErrorResponse;
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

    const url = `${config.env.apiEndPoint}/auth/image`;

    const response = await fetch(url, {
      method: "POST",
      body: formData,
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(30000), // 30 seconds
    });
    console.log("Upload response:", response);
    if (!response.ok) {
      let errorMessage = "Upload failed";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        errorMessage = `Upload failed with status ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    const data: UploadedImageData = await response.json();

    if (!data.url) {
      throw new Error("Invalid response: missing image URL");
    }

    return {
      success: true,
      data,
    } as ActionResponse<UploadedImageData>;
  } catch (err) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : "An unknown error occurred during upload";

    console.error("Upload error:", errorMessage);
    return handleError(new Error(errorMessage)) as ErrorResponse;
  }
};

export function formatPrice(price: number, currency: string = "$"): string {
  return `${price.toFixed(2)} ${currency}`;
}

export function formatAddress(address: {
  city: string;
  phone: string;
  details: string;
}) {
  const normalize = (text: string) =>
    text
      .trim()
      .replace(/\s*-\s*/g, " - ")
      .replace(/\s+/g, " ");

  const formatCity = (city: string) => {
    const c = normalize(city);
    return c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
  };

  return {
    city: formatCity(address.city),
    phone: address.phone.trim(),
    details: normalize(address.details).toLowerCase(),
  };
}

/**
 * Validates Egyptian phone number
 * Format: 0 + [10,11,12,15] + 8 digits
 * Examples: 01012345678, 01112345678, 01212345678, 01512345678
 */
export function isValidEgyptianPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\s|-/g, ""); // Remove spaces/dashes
  const regex = /^0(10|11|12|15)\d{8}$/;
  return regex.test(cleanPhone);
}

export function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

export function isIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function isInAppBrowser() {
  if (typeof window === "undefined") return false;

  const ua = navigator.userAgent || "";
  const vendor = navigator.vendor || "";
  const referrer = document.referrer || "";

  // Known in-app signals
  const inAppRegex = /FBAN|FBAV|Instagram|Line|Twitter|Snapchat|Pinterest/i;

  // TikTok sometimes hides UA but sets referrer
  const isTikTokReferrer = referrer.includes("tiktok.com");

  // WebView signal (Android)
  const isWebView = /(wv|WebView)/i.test(ua) && !/Chrome/i.test(ua);

  return (
    inAppRegex.test(ua) || isTikTokReferrer || isWebView || vendor === "" // very common for WebViews
  );
}
