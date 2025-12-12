import mongoose, { models, Document } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  image?: string;
  role: "user" | "admin";
}
export interface IUserDoc extends IUser, Document {}

const UserSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    image: { type: String },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1, createdAt: -1 });

const User = models?.User || mongoose.model<IUser>("User", UserSchema);

export default User;
