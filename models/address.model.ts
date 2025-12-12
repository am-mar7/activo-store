import mongoose, { models, Schema, Types, Document } from "mongoose";

export interface IAddress {
  userId: Types.ObjectId;
  isDefault: boolean;
  city: string;
  phone: string;
  details: string;
}
export interface IAddressDoc extends IAddress, Document {}

const AddressSchema = new mongoose.Schema<IAddress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    isDefault: { type: Boolean, default: false },
    city: { type: String, required: true },
    phone: { type: String, required: true },
    details: { type: String, required: true },
  },
  { timestamps: true }
);

AddressSchema.index({ userId: 1, isDefault: 1 });

const Address =
  models?.Address || mongoose.model<IAddress>("Address", AddressSchema);

export default Address;
