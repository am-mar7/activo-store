import mongoose, { models, Schema, Types, Document } from "mongoose";

export interface ICart {
  userId: Types.ObjectId;
  cartItems: Types.ObjectId[];
}
export interface ICartDoc extends ICart, Document {}

const CartSchema = new mongoose.Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      unique: true, // auto indexing
    },
    cartItems: [
      {
        type: Schema.Types.ObjectId,
        ref: "CartItem",
      },
    ],
  },
  { timestamps: true }
);

const Cart = models?.Cart || mongoose.model<ICart>("Cart", CartSchema);

export default Cart;
