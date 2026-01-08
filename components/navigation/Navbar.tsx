import ROUTES from "@/constants/routes";
import Link from "next/link";
import { LiaOpencart } from "react-icons/lia";
import SearchToggler from "../buttons/SearchToggler";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { getCategories } from "@/lib/server actions/category.action";
import Image from "next/image";
import MobileNavigation from "./MobileNavigation";
import { cn } from "@/lib/utils";
import { auth } from "@/auth";
import UserAvatar from "../UserAvatar";

interface Props {
  className?: string;
  isHome?: boolean;
}

export default async function Navbar({ className, isHome = false }: Props) {
  const [{ data }, session] = await Promise.all([getCategories({}), auth()]);

  const user = session?.user;
  const { categories } = data || {};
  console.log(session?.user);
  
  const serializedCategories =
    categories?.map((cat) => ({
      _id: cat._id,
      name: cat.name,
      slug: cat.slug,
    })) || [];

  return (
    <div
      className={cn(
        className,
        "px-5 sm:px-10 py-2.5 flex-between bg-transparent"
      )}
    >
      <div className="flex-center gap-3 sm:hidden">
        <MobileNavigation invert={isHome} categories={serializedCategories} />
        <Link href={ROUTES.HOME}>
          <Image
            src="/images/site-logo2.png"
            alt="site-logo"
            width={25}
            height={25}
          />
        </Link>
      </div>

      <div className="flex-center max-sm:hidden">
        <Link
          href={ROUTES.COLLECTION("all")}
          className={`mr-4 ${
            isHome ? "text-slate-100" : "text-slate-700 hover:text-slate-900"
          } transition-colors font-medium`}
        >
          shop all
        </Link>

        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger
                className={`bg-transparent text-md border-none hover:bg-transparent! p-0! hover:underline shadow-none mr-2 ${
                  isHome
                    ? "text-slate-100 hover:text-slate-100 data-[state=open]:text-slate-100! focus:text-slate-100!"
                    : "text-slate-700 hover:text-slate-900"
                } focus:bg-transparent! focus-visible:bg-transparent! focus:outline-none focus-visible:ring-0 data-[state=open]:bg-transparent! data-[state=open]:underline data-active:bg-transparent!`}
              >
                shop by category
              </NavigationMenuTrigger>
              <NavigationMenuContent className="bg-neutral-50! hover: z-2">
                <ul className="grid w-50 gap-1">
                  {categories?.map((category, idx) => (
                    <li key={category._id || idx}>
                      <NavigationMenuLink asChild>
                        <Link
                          href={ROUTES.CATEGORY(category.slug)}
                          className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100"
                        >
                          {category.name}
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger
                className={`bg-transparent text-md border-none hover:bg-transparent! p-0! hover:underline shadow-none ${
                  isHome
                    ? "text-slate-100 hover:text-slate-100 data-[state=open]:text-slate-100! focus:text-slate-100!"
                    : "text-slate-700 hover:text-slate-900"
                } focus:bg-transparent! focus-visible:bg-transparent! focus:outline-none focus-visible:ring-0 data-[state=open]:bg-transparent! data-[state=open]:underline data-active:bg-transparent!`}
              >
                collections
              </NavigationMenuTrigger>
              <NavigationMenuContent className="bg-neutral-50! z-100">
                <ul className="grid w-50 gap-1">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href={ROUTES.COLLECTION("winter")}
                        className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100"
                      >
                        winter
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href={ROUTES.COLLECTION("summer")}
                        className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100"
                      >
                        summer
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <div className="flex-center">
        <SearchToggler
          className={`mr-1 sm:mr-3 ${
            isHome ? "text-slate-100" : "text-slate-900"
          }`}
        />
        {!user ? (
          <Link
            className={`px-6 py-1 border-2 border-primary text-primary rounded-lg font-medium hover:border-white ${isHome ? "text-slate-50":"text-slate-900"}  transition-all duration-200`}
            href={ROUTES.SIGN_IN}
          >
            Login
          </Link>
        ) : (
          <>
            <Link href={ROUTES.CART} className="flex-center mr-3 sm:mr-4">
              <LiaOpencart
                className={`w-7 h-7 ${
                  isHome ? "text-slate-100" : "text-slate-900"
                }`}
              />
            </Link>
            <Link href={ROUTES.PROFILE} className="flex-center">
                <UserAvatar isHome={isHome} user={user}/>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
