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
import * as motion from "motion/react-client";

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
      <motion.div
        className="min-h-screen w-full flex flex-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StateSkeleton
            icon={<AlertCircle className="w-32 h-32 stroke-[1.5]" />}
            title={getFriendlyErrorMessage(error?.message) || "Error"}
            message={
              getFriendlyErrorMessage(JSON.stringify(error?.details)) ||
              "Something went wrong"
            }
            error={true}
          />
        </motion.div>
      </motion.div>
    );
  }

  if (data?.length === 0 || !data) {
    return (
      <motion.div
        className="min-h-screen flex flex-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StateSkeleton
            icon={<PackageOpen className="w-32 h-32 stroke-[1.5]" />}
            title="Your cart feels lonely"
            message="Let's fill it with something special"
            button={{
              text: "Browse Products",
              href: ROUTES.COLLECTION("all"),
            }}
          />
        </motion.div>
      </motion.div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30, scale: 0.95 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        type: "spring" as const,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      className="flex-center flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl px-5 w-full py-8">
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.6,
            delay: 0.1,
            type: "spring",
            stiffness: 100,
          }}
        >
          <h2 className="base-bold text-shadow-slate-900">
            Your Shopping Cart
          </h2>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4">
          <motion.div
            className="flex my-2 flex-col gap-3 w-full sm:w-2/3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {data?.map((item) => (
              <motion.div
                key={item.variantSku}
                variants={itemVariants}
                whileHover={{ x: 5, scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <CartCard
                  product={item.product}
                  variantSku={item.variantSku}
                  initialQuantity={item.quantity}
                />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="w-full sm:w-1/3"
            initial={{ opacity: 0, x: 30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{
              duration: 0.6,
              delay: 0.4,
              type: "spring",
              stiffness: 100,
            }}
          >
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <CheckoutForm
                items={data}
                subTotal={getSubtotal()}
                className="h-fit bg-netural-50 rounded-lg p-3 sm:p-4 md:p-5 shadow-md"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
