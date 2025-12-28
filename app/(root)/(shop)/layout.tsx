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
      {children}
      <Footer />
    </div>
  );
}
