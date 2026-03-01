import { FastNavigation } from "@/components/navigation/FastNavigaion";
import Navbar from "@/components/navigation/Navbar";
import TryAgain from "@/components/TryAgain";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { getSettings } from "@/lib/server actions/settings.action";
import Maintenance from "@/components/Maintanenance";
import { Suspense } from "react";
import Loading from "@/app/loading";
import SnowEffect from "@/components/SnowEffect";
import HeroSection from "./heroSection";

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
  const { enabled, text, backgroundColor, textColor, link, startsAt, endsAt } = topBanner;

  if (maintenance?.enabled)
    return <Maintenance message={maintenance?.message} />;

  const now = new Date();
  let isBannerActive = enabled;
  if (startsAt) isBannerActive = isBannerActive && now >= new Date(startsAt);
  if (endsAt) isBannerActive = isBannerActive && now <= new Date(endsAt);

  return (
    <div>
      {/* HeroSection owns the image, gradients, and content */}
      <HeroSection
        title={heroSection?.title}
        subtitle={heroSection?.subtitle}
        image={heroSection?.image}
        cta={heroSection?.cta}
        topBanner={
          isBannerActive ? { text, backgroundColor, textColor, link } : undefined
        }
        navbar={<Navbar className="relative z-20" isHome={true} />}
      />

      <SnowEffect className="hidden md:block" />
      {children}
      <FastNavigation />
    </div>
  );
}