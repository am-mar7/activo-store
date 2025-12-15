import mongoose, { models, Document, Types } from "mongoose";

export interface IAddress {
  _id?: Types.ObjectId;
  isDefault: boolean;
  city: string;
  phone: string;
  details: string;
}

export const AddressSchema = new mongoose.Schema<IAddress>({
  isDefault: { type: Boolean, default: false, required: true },
  city: { type: String, required: true },
  phone: { type: String, required: true },
  details: { type: String, required: true },
});

export interface IUser {
  name: string;
  email: string;
  image?: string;
  role: "user" | "admin";
  addresses: IAddress[];
}
export interface IUserDoc extends IUser, Document {}

const UserSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },
    addresses: {
      type: [AddressSchema],
      required: true,
      default: [],
      validate: {
        validator: (v: IAddress[]) => v.length <= 10,
        message: "Maximum 10 addresses allowed",
      },
    },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1, createdAt: -1 });
UserSchema.index({ "addresses.isDefault": 1 });

const User = models?.User || mongoose.model<IUser>("User", UserSchema);

export default User;
