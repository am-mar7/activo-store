import mongoose, { models, Document } from "mongoose";

export interface IPromoCode {
  code: string;
  percentage: number;
  maxDiscount: number;
  minPurchase: number;
  usageLimit?: number;
  usageCount: number;
  expiredAt?: Date;
}
export interface IPromoCodeDoc extends IPromoCode, Document {}

const PromoCodeSchema = new mongoose.Schema<IPromoCode>(
  {
    code: { type: String, required: true, unique: true },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    maxDiscount: { type: Number, required: true, default: 50, min: 0 },
    minPurchase: { type: Number, required: true, min: 0 },
    usageLimit: { type: Number, required: false, min: 0 },
    usageCount: { type: Number, required: true, default: 0, min: 0 },
    expiredAt: { type: Date, required: false, index: true },
  },
  { timestamps: true }
);

PromoCodeSchema.pre("save", async function () {
  if (this.usageLimit && this.usageCount > this.usageLimit) {
    throw new Error("Usage count cannot exceed usage limit");
  }
});

const PromoCode =
  models?.PromoCode || mongoose.model<IPromoCode>("PromoCode", PromoCodeSchema);

export default PromoCode;
