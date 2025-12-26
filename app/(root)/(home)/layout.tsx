import Navbar from "@/components/navigation/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div 
        className="bg-cover bg-center relative bg-no-repeat h-125 md:h-150 lg:h-175"
        style={{ backgroundImage: "url('/images/hero.png')" }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <Navbar className="relative z-10" isHome={true} />
        <div className="flex items-center justify-center relative z-2 h-full pt-20">
          <div className="text-white text-center">
            <h1 className="text-4xl md:text-6xl font-bold">Best of 2025</h1>
            <p className="text-xl mt-4">find your style here</p>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}