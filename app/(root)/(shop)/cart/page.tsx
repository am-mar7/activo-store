import { auth } from "@/auth";
import CartCard from "@/components/cards/CartCard";
import { StateSkeleton } from "@/components/DataRenderer";
import CheckoutForm from "@/components/forms/CheckoutForm";
import ROUTES from "@/constants/routes";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { getCartItems } from "@/lib/server actions/cart.action";
import { AlertCircle, PackageOpen } from "lucide-react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import Loading from "@/app/loading";

export const metadata: Metadata = {
  title: "Activo Store | Cart",
  description:
    "Review your shopping cart and proceed to secure checkout. Free shipping on orders over $50.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "https://activo-store.vercel.app.com/cart",
  },
};

export default function Cart() {
  return (
    <Suspense fallback={<Loading />}>
      <CartContent />
    </Suspense>
  );
}

async function CartContent() {
  {
    const session = await auth();
    const userId = session?.user.id;
    if (!userId) return redirect(ROUTES.SIGN_IN);

    const { success, data, error } = await getCartItems(userId);

    const getSubtotal = (): number => {
      let subTotal = 0;
      data?.forEach((item) => {
        subTotal += item.product.newPrice * item.quantity;
      });
      return subTotal;
    };

    if (!success || error) {
      return (
        <div className="min-h-screen w-full flex flex-center">
          <StateSkeleton
            icon={<AlertCircle className="w-32 h-32 stroke-[1.5]" />}
            title={getFriendlyErrorMessage(error?.message) || "Error"}
            message={
              getFriendlyErrorMessage(JSON.stringify(error?.details)) ||
              "Something went wrong"
            }
            error={true}
          />
        </div>
      );
    }

    if (data?.length === 0 || !data) {
      return (
        <StateSkeleton
          icon={<PackageOpen className="w-32 h-32 stroke-[1.5]" />}
          title="Your cart feels lonely"
          message="Let's fill it with something special"
          button={{
            text: "Browse Products",
            href: ROUTES.COLLECTION("all"),
          }}
        />
      );
    }

    return (
      <div className="flex-center flex-col">
        <div className="max-w-7xl px-5 w-full">
          <h2 className="base-bold text-shadow-slate-900">
            Your Shopping Cart
          </h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex my-2 flex-col gap-2 w-full sm:w-2/3">
              {data?.map((item) => (
                <CartCard
                  key={item.variantSku}
                  product={item.product}
                  variantSku={item.variantSku}
                  initialQuantity={item.quantity}
                />
              ))}
            </div>
            <div className="w-full sm:w-1/3">
              <CheckoutForm
                items={data}
                subTotal={getSubtotal()}
                className="h-fit bg-netural-50 rounded-lg p-3 sm:p-4 md:p-5 shadow-md"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
