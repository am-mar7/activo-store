import mongoose, { models, Schema, Types, Document } from "mongoose";

export interface IAccount {
  userId: Types.ObjectId;
  name: string;
  password?: string;
  image?: string;
  provider: "google" | "credentials";
  providerAccountId: string;
}
export interface IAccountDoc extends IAccount, Document {}

const AccountSchema = new mongoose.Schema<IAccount>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    password: { type: String },
    image: { type: String, required: false },
    provider: { type: String, enum: ["credentials", "google"], required: true },
    providerAccountId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

AccountSchema.index({ userId: 1 });
AccountSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });

const Account =
  models?.Account || mongoose.model<IAccount>("Account", AccountSchema);

export default Account;
