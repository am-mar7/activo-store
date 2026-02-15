import Loading from "@/app/loading";
import Footer from "@/components/Footer";
import Maintenance from "@/components/Maintanenance";
import { Breadcrumbs } from "@/components/navigation/BreadCrumb";
import { FastNavigation } from "@/components/navigation/FastNavigaion";
import Navbar from "@/components/navigation/Navbar";
import SnowEffect from "@/components/SnowEffect";
import TopBanner from "@/components/TopBanner";
import TryAgain from "@/components/TryAgain";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { getSettings } from "@/lib/server actions/settings.action";
import { Suspense } from "react";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<Loading />}>
      {ShopLayoutContent({ children })}
    </Suspense>
  );
}

async function ShopLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { success, error, data } = await getSettings();
  if (!success || error || !data)
    return <TryAgain message={getFriendlyErrorMessage(error)} />;

  const { topBanner, maintenance } = data;
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
      {isBannerActive && (
        <TopBanner
          link={link}
          text={text}
          backgroundColor={backgroundColor}
          textColor={textColor}
        />
      )}
      <Navbar className="shadow-md" />
      <div className="flex flex-center mt-2">
        <Breadcrumbs className="w-full max-w-7xl px-5" />
      </div>
      <SnowEffect />
      <div className="min-h-[60vh]">{children}</div>
      <FastNavigation />
      <Footer />
    </div>
  );
}
