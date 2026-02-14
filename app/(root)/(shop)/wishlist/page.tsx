import { auth } from "@/auth";
import ProductCard from "@/components/cards/ProductCard";
import DataRenderer from "@/components/DataRenderer";
import ROUTES from "@/constants/routes";
import { getWishlist } from "@/lib/server actions/wishlist.action";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import Loading from "@/app/loading";
import * as motion from "motion/react-client";

export const metadata: Metadata = {
  title: "Activo Store | Wishlist",
  description:
    "View and manage your saved items. Keep track of your favorite products at Activo Store.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "https://activo-store.vercel.app.com/wishlist",
  },
};

export default function Wishlist() {
  return (
    <Suspense fallback={<Loading />}>
      <WishlistContent />
    </Suspense>
  );
}

async function WishlistContent() {
  const session = await auth();
  const userId = session?.user.id;
  if (!userId) return redirect(ROUTES.SIGN_IN);

  const { success, data, error } = await getWishlist(userId);

  const products = data?.map((item) => item.product) || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4 },
    },
  };

  return (
    <motion.div
      className="flex-center flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl">
        <DataRenderer
          data={products}
          success={success}
          error={error}
          empty={{
            title: "Your wishlist is empty",
            message:
              "You don't have any products in the wishlist yet, Go browse some products",
            button: {
              text: "browse",
              href: ROUTES.COLLECTION("all"),
            },
          }}
          render={(products) => (
            <>
              <motion.h2
                className="text-slate-800 h3-semibold px-5"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Your Wishlist
              </motion.h2>
              <motion.div
                className="mt-3 grid grid-cols-2 px-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {products?.map((product) => (
                  <motion.div key={product._id} variants={itemVariants}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        />
      </div>
    </motion.div>
  );
}
