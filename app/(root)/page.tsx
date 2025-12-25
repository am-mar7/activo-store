import Image from "next/image";

export default function Home() {
  return (
    <div className="relative w-full h-125 md:h-150 lg:h-175">
      <Image
        src="/images/hero.png"
        alt="hero section"
        fill
        className="object-cover"
        priority
        quality={100}
      />
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-4xl md:text-6xl font-bold">
            Best of {new Date().getFullYear().toString()}
          </h1>
          <p className="text-xl mt-4">find your style here</p>
        </div>
      </div>
    </div>
  );
}
