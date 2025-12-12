import mongoose, { models, Schema, Types, Document } from "mongoose";

export interface ICartItem {
  cartId: Types.ObjectId;
  variant: Types.ObjectId;
  quantity: number;
}
export interface ICartItemDoc extends ICartItem, Document {}

const CartItemSchema = new mongoose.Schema<ICartItem>(
  {
    cartId: {
      type: Schema.Types.ObjectId,
      ref: "Cart",
      required: true,
      index: true,
    },
    variant: {
      type: Schema.Types.ObjectId,
      ref: "Variant",
      required: true,
    },
    quantity: { type: Number, default: 1, min: 1 },
  },
  { timestamps: true }
);

CartItemSchema.index({ cartId: 1, variant: 1 });

const CartItem =
  models?.CartItem || mongoose.model<ICartItem>("CartItem", CartItemSchema);

export default CartItem;
