import { Button } from "@/components/ui/button";
import { AlignLeft } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import LogoutBtn from "@/components/buttons/LogoutBtn";
import NavLinks from "./Navlinks";

export default async function MobileNavigation() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="px-2.5! py-1! sm:hidden">
          <AlignLeft />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="bg-neutral-50 border-none px-5 py-8 sm:hidden"
      >
        <SheetTitle className="hidden">Navigation</SheetTitle>
        <div>
          <h1 className="h3-semibold text-primary-gradient px-2.5 font-space-grotesk">
            Dashboard
          </h1>

          <div className="space-y-4 mt-6">
            <NavLinks isMobile />
          </div>
        </div>
        <SheetFooter>
          <LogoutBtn isMobile />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
