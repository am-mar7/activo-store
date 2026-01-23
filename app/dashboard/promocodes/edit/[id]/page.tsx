import PromoCodeForm from "@/components/dashboard/forms/PromoCodeForm";
import TryAgain from "@/components/TryAgain";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { getPromoCode } from "@/lib/server actions/promocode.action";
import { RouteParams } from "@/types/global";
import { notFound } from "next/navigation";

export default async function EditPromoCode({ params }: RouteParams) {
  const { id } = await params;
  const { success, error, data } = await getPromoCode(id);

  if (error || !success)
    return <TryAgain message={getFriendlyErrorMessage(error)} />;
  if (!data) return notFound();
  const {
    code,
    expiredAt,
    minPurchase,
    percentage,
    maxDiscount,
    usageCount,
    usageLimit,
  } = data;
  const defaultValues = {
    code,
    percentage,
    maxDiscount,
    minPurchase,
    expiredAt: expiredAt ? new Date(expiredAt) : undefined,
    usageCount,
    usageLimit,
  };
  return (
    <>
      <PromoCodeForm
        formType="EDIT"
        id={data._id}
        defaultValues={defaultValues}
      />
    </>
  );
}
