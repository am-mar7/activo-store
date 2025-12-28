import Footer from "@/components/Footer";
import Navbar from "@/components/navigation/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Navbar className="shadow-md" />
      <div className="min-h-[65vh]">{children}</div>
      <Footer />
    </div>
  );
}
