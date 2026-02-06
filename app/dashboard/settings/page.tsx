import Loading from "@/app/loading";
import SettingsForm from "@/components/dashboard/forms/SettingsForm";
import TryAgain from "@/components/TryAgain";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { getSettings } from "@/lib/server actions/settings.action";
import { Suspense } from "react";

export default function Settings() {
  return (
    <Suspense fallback={<Loading />}>
      <SettingsContent />
    </Suspense>
  );
}

async function SettingsContent() {
  const { success, error, data } = await getSettings();
  if (!success || error || !data)
    return <TryAgain message={getFriendlyErrorMessage(error)} />;

  const defaultValues = {
    ...data,
    heroSection: { ...data.heroSection, image: undefined },
  };
  const { heroSection } = data;
  const heroImage = heroSection.image || "images/hero.png";
  return (
    <>
      <SettingsForm
        defaultValues={defaultValues}
        existingHeroImage={heroImage}
      />
    </>
  );
}
