import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import { auth } from "@/auth";
import { getWishlistIds } from "@/lib/server actions/wishlist.action";
import { WishlistInitializer } from "@/components/Initializers/WishlistInitializer";
import { getCartState } from "@/lib/server actions/cart.action";
import { CartInitializer } from "@/components/Initializers/CartInitializer";
import { CartItemStore } from "@/stores/useCartStore";
import { SessionProvider } from "next-auth/react";
import { getSettings } from "@/lib/server actions/settings.action";
import { SettingsInitializer } from "@/components/Initializers/SettingsInitilizer";
import TryAgain from "@/components/TryAgain";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { Suspense } from "react";

export const metadata: Metadata = {
  metadataBase: new URL("https://activo-store.vercel.app.com"),
  title: {
    default: "Activo Store",
    template: "%s",
  },
  description:
    "Shop premium activewear and lifestyle clothing at Activo Store. Free shipping on orders over EGP 500.",
  keywords:
    "activewear, athletic clothing, gym wear, sports clothing, lifestyle apparel, Activo Store",
  authors: [{ name: "Activo Store" }],
  creator: "Activo Store",
  publisher: "Activo Store",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Activo Store",
  },
  twitter: {
    card: "summary_large_image",
  },
  verification: {
    google: "your-google-verification-code", // Add when you set up Google Search Console
  },
};

const Inter = localFont({
  src: "../public/fonts/interVF.ttf",
  variable: "--font-inter",
  weight: "100 to 900",
});

const SpaceGrotesk = localFont({
  src: "../public/fonts/SpaceGroteskVF.ttf",
  variable: "--font-space-grotesk",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Suspense> {layoutContent({ children })} </Suspense>;
}

async function layoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [session, { success, error, data }] = await Promise.all([
    auth(),
    getSettings(),
  ]);
  const userId = session?.user.id;
  let wishlistIds: string[] = [];
  let cartItems: CartItemStore[] = [];
  if (userId) {
    const [{ data }, result] = await Promise.all([
      getWishlistIds(userId),
      getCartState(session.user.id),
    ]);
    console.log("result", result);

    if (result.success && result.data) cartItems = result.data.cartItems;
    if (data) wishlistIds = data;
  }

  if (!success || error || !data)
    return <TryAgain message={getFriendlyErrorMessage(error)} />;

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Activo Store",
              alternateName: "Activostore",
              url: "https://activostore.com",
              logo: "images/site-logo2.png",
            }),
          }}
        />
      </head>
      <body
        className={`${Inter.className} ${SpaceGrotesk.variable} antialiased`}
      >
        <SessionProvider session={session}>
          <CartInitializer cartItems={cartItems} />
          <WishlistInitializer wishlistIds={wishlistIds} />
          <SettingsInitializer settings={data} />
          <Toaster position="top-right" richColors />
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
