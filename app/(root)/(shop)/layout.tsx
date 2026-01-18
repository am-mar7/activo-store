import Footer from "@/components/Footer";
import { Breadcrumbs } from "@/components/navigation/BreadCrumb";
import { FastNavigation } from "@/components/navigation/FastNavigaion";
import Navbar from "@/components/navigation/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Navbar className="shadow-md" />
      <div className="flex flex-center mt-2">
        <Breadcrumbs className="w-full max-w-7xl px-5" />
      </div>
      <div className="min-h-[60vh]">{children}</div>
      <FastNavigation/>
      <Footer />
    </div>
  );
}
