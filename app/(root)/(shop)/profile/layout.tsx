import Loading from "@/app/loading";
import { auth } from "@/auth";
import LogoutBtn from "@/components/buttons/LogoutBtn";
import TryAgain from "@/components/TryAgain";
import ROUTES from "@/constants/routes";
import api from "@/lib/api";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { getWishlistIds } from "@/lib/server actions/wishlist.action";
import { IUserDoc } from "@/models/user.model";
import { ActionResponse } from "@/types/global";
import { Heart, Package, MapPin, User } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<Loading />}>
      {ProfileLayoutContent({ children })}
    </Suspense>
  );
}

async function ProfileLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return redirect(ROUTES.SIGN_IN);

  const [userResponse, { data: wishlistIds }] = await Promise.all([
    api.users.getById(userId) as Promise<ActionResponse<IUserDoc>>,
    getWishlistIds(userId),
  ]);

  const { success, data: user, error } = userResponse;

  if (!user || !success)
    return <TryAgain message={getFriendlyErrorMessage(error)} />;

  const wishlistCount = wishlistIds?.length || 0;
  const addressCount = user.addresses?.length || 0;

  const navLinks = [
    {
      href: ROUTES.PROFILE,
      icon: Package,
      label: "Orders",
      description: "View your orders",
    },
    {
      href: ROUTES.ADDRESSES,
      icon: MapPin,
      label: "Addresses",
      description: "Manage delivery addresses",
      count: addressCount,
    },
    {
      href: ROUTES.WISHLIST,
      icon: Heart,
      label: "Wishlist",
      description: "Saved items",
      count: wishlistCount,
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-neutral-400 rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-neutral-500 backdrop-blur-sm flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="body-bold sm:h2-bold text-white mb-1">
                Welcome Back, {user.name}
              </h1>
              <p className="text-white/90 small-regular sm:text-sm">
                Manage your account and orders
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <aside className="lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
              <div className="p-4 bg-linear-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <h2 className="font-semibold text-primary text-lg">
                  Account Menu
                </h2>
              </div>

              <nav className="p-2 space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-slate-50 active:bg-slate-100 transition-colors rounded-xl group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-primary group-hover:text-primary/90">
                            {link.label}
                          </div>
                          <div className="text-xs text-secondary">
                            {link.description}
                          </div>
                        </div>
                      </div>

                      {link.count !== undefined && link.count > 0 && (
                        <div className="px-2.5 py-1 rounded-full bg-primary text-white text-xs font-semibold">
                          {link.count}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-2 border-t border-slate-200">
                <LogoutBtn
                  removeTxtAt="never"
                  className="w-full justify-start hover:bg-red-50 active:bg-red-100 border-0"
                />
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <Suspense fallback={<Loading />}>{children}</Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
