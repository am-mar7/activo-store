import { auth } from "@/auth";
import LogoutBtn from "@/components/buttons/LogoutBtn";
import TryAgain from "@/components/TryAgain";
import ROUTES from "@/constants/routes";
import api from "@/lib/api";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { getWishlistIds } from "@/lib/server actions/wishlist.action";
import { IUserDoc } from "@/models/user.model";
import { ActionResponse } from "@/types/global";
import { Heart, LayoutDashboard, MapPin } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProfileLayout({
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
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      href: ROUTES.ADDRESSES,
      icon: MapPin,
      label: "Addresses",
      count: addressCount,
    },
    {
      href: ROUTES.WISHLIST,
      icon: Heart,
      label: "Wishlist",
      count: wishlistCount,
    },
  ];

  return (
    <div className="flex-center flex-col">
      <div className="max-w-7xl w-full px-5">
        {/* Header */}
        <div className="bg-gray-100 py-6 mb-8 px-4">
          <h1 className="text-2xl font-semibold text-center">
            WELCOME BACK {user.name.toUpperCase()}
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Sidebar Navigation */}
          <aside className="space-y-2 lg:min-w-60">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center border border-slate-500 gap-1.5 px-4 py-3 hover:bg-gray-100 transition-colors rounded group"
                >
                  <Icon className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {link.label}
                    {link.count !== undefined && ` (${link.count})`}
                  </span>
                </Link>
              );
            })}
            <LogoutBtn
              removeTxtAt="never"
              className="border border-slate-500 min-h-11 bg-neutral-50! justify-start!"
            />
          </aside>

          {/* Main Content */}
          <main className="md:col-span-3">{children}</main>
        </div>
      </div>
    </div>
  );
}
