import { FastNavigation } from "@/components/navigation/FastNavigaion";
import Navbar from "@/components/navigation/Navbar";
import TryAgain from "@/components/TryAgain";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { getSettings } from "@/lib/server actions/settings.action";
import Link from "next/link";
import Image from "next/image";
import TopBanner from "@/components/TopBanner";
import Maintenance from "@/components/Maintanenance";
import { Suspense } from "react";
import Loading from "@/app/loading";
import SnowEffect from "@/components/SnowEffect";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<Loading />}>
      {HomeLayoutContent({ children })}
    </Suspense>
  );
}

async function HomeLayoutContent({ children }: { children: React.ReactNode }) {
  const { success, error, data } = await getSettings();
  if (!success || error || !data)
    return <TryAgain message={getFriendlyErrorMessage(error)} />;

  const { heroSection, topBanner, maintenance } = data;
  const { title, subtitle, image, cta } = heroSection;
  const { enabled, text, backgroundColor, textColor, link, startsAt, endsAt } =
    topBanner;

  if (maintenance?.enabled)
    return <Maintenance message={maintenance?.message} />;

  const now = new Date();
  let isBannerActive = enabled;

  if (startsAt) isBannerActive = isBannerActive && now >= new Date(startsAt);
  if (endsAt) isBannerActive = isBannerActive && now <= new Date(endsAt);

  return (
    <div>
      <div className="relative h-125 md:h-150 lg:h-175 overflow-hidden">
        <Image
          src={image || "/images/hero.png"}
          alt="Hero Background"
          fill
          style={{ objectFit: "cover", objectPosition: "center" }}
          className="z-0"
        />

        {isBannerActive && (
          <TopBanner
            link={link}
            text={text}
            backgroundColor={backgroundColor}
            textColor={textColor}
          />
        )}
        <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/20 to-black/50 z-10"></div>

        <Navbar className="relative z-20" isHome={true} />

        <div className="relative z-10 flex flex-col justify-center h-full px-6 md:px-20 lg:px-32">
          <h1 className="text-4xl md:text-6xl 2xl:text-7xl font-extrabold text-white drop-shadow-xl animate-fadeInUp">
            {title || "Best of 2025"}
          </h1>
          <p className="mt-4 md:mt-6 text-lg md:text-xl text-gray-200 max-w-lg animate-fadeInUp delay-200">
            {subtitle || "Find your style here"}
          </p>

          {cta && cta.text && cta.href && (
            <Link href={cta.href}>
              <button className="mt-6 md:mt-8 bg-linear-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 px-7 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 animate-fadeInUp delay-400">
                {cta.text || "Shop Now"}
              </button>
            </Link>
          )}
        </div>

        <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary-600/30 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-10 left-10 w-24 h-24 bg-primary-400/20 rounded-full blur-2xl animate-pulse-slow delay-200"></div>
      </div>
      <SnowEffect />
      {children}
      <FastNavigation />
    </div>
  );
}
