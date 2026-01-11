import { auth } from "@/auth";
import CartCard from "@/components/cards/CartCard";
import DataRenderer from "@/components/DataRenderer";
import ROUTES from "@/constants/routes";
import { getCartItems } from "@/lib/server actions/cart.action";
import { redirect } from "next/navigation";

export default async function Cart() {
  const session = await auth();
  const userId = session?.user.id;
  if (!userId) return redirect(ROUTES.SIGN_IN);

  const { success, data, error } = await getCartItems(userId);
  console.log("cart items", data);

  return (
    <div className="flex-center flex-col">
      <div className="max-w-7xl px-5 w-full flex flex-col lg:flex-row gap-2">
        <div className="w-full lg:w-2/3 ">
          <DataRenderer
            data={data}
            error={error}
            success={success}
            empty={{
              title: "Your cart feels lonely",
              message: "Let's fill it with something special",
              button: {
                text: "Browse Products",
                href: ROUTES.COLLECTION("all"),
              },
            }}
            render={(data) => (
              <div className="flex my-2 flex-col gap-2 w-full">
                {data?.map((item) => (
                  <CartCard
                    key={item.variantSku}
                    product={item.product}
                    variantSku={item.variantSku}
                    initialQuantity={item.quantity}
                  />
                ))}
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
}
