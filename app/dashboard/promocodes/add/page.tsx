import PromoCodeForm from "@/components/dashboard/forms/PromoCodeForm";

export default function AddPromoCode() {
  const defaultValues = {
    code: "",
    percentage: 10,
    maxDiscount: 100,
    minPurchase: 1000,
  };
  return (
    <>
      <PromoCodeForm formType="ADD" defaultValues={defaultValues} />
    </>
  );
}
