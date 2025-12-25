import ROUTES from "@/constants/routes";
import Link from "next/link";
import { LiaOpencart } from "react-icons/lia";
import { FaRegUserCircle } from "react-icons/fa";
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

export default async function Navbar() {
  const { data } = await getCategories({});
  const { categories } = data || {};
  console.log(categories);
  const serializedCategories =
    categories?.map((cat) => ({
      _id: cat._id,
      name: cat.name,
      slug: cat.slug,
    })) || [];
  return (
    <div className="shadow-md px-5 sm:px-10 py-2.5 flex-between bg-transparent">
      <div className="flex-center gap-3 sm:hidden">
        <MobileNavigation categories={serializedCategories} />
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
          href={ROUTES.HOME}
          className="mr-4 text-slate-700 hover:text-slate-900 transition-colors font-medium"
        >
          shop all
        </Link>

        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent text-md border-none hover:bg-transparent! p-0! hover:underline shadow-none text-slate-700 hover:text-slate-900 focus:bg-transparent! focus-visible:bg-transparent! focus:outline-none focus-visible:ring-0 data-[state=open]:bg-transparent! data-[state=open]:underline data-active:bg-transparent!">
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
              <NavigationMenuTrigger className="bg-transparent text-md border-none hover:bg-transparent! p-0! hover:underline shadow-none text-slate-700 hover:text-slate-900 focus:bg-transparent! focus-visible:bg-transparent! focus:outline-none focus-visible:ring-0 data-[state=open]:bg-transparent! data-[state=open]:underline data-active:bg-transparent! ml-2.5">
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
        <SearchToggler className="mr-1 sm:mr-3" />
        <Link href={ROUTES.CART} className="flex-center mr-3 sm:mr-5">
          <LiaOpencart className="w-7 h-7 text-slate-900" />
        </Link>
        <Link href={ROUTES.PROFILE} className="flex-center">
          <FaRegUserCircle className="w-6 h-6 text-slate-900 font-bold" />
        </Link>
      </div>
    </div>
  );
}
