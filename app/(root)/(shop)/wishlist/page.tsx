import { auth } from "@/auth";
import ProductCard from "@/components/cards/ProductCard";
import DataRenderer from "@/components/DataRenderer";
import ROUTES from "@/constants/routes";
import { getWishlist } from "@/lib/server actions/wishlist.action";
import { redirect } from "next/navigation";
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Activo Store | Wishlist',
  description: 'View and manage your saved items. Keep track of your favorite products at Activo Store.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: 'https://activo-store.vercel.app.com/wishlist',
  },
}

export default async function Wishlist() {
  const session = await auth();
  const userId = session?.user.id;
  if (!userId) return redirect(ROUTES.SIGN_IN);

  const { success, data, error } = await getWishlist(userId);

  const products = data?.map((item) => item.product) || [];
  return (
    <div className="flex-center flex-col">
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
              <h2 className="text-slate-800 h3-semibold px-5">Your Wishlist</h2>
              <div className="mt-3 grid grid-cols-2 px-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid:cols-6 gap-4">
                {products?.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </>
          )}
        />
      </div>
    </div>
  );
}
