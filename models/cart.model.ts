import mongoose, { models, Schema, Types, Document } from "mongoose";

export interface ICartItem {
  product: Types.ObjectId;
  variantSku: string;
  quantity: number;
}

const CartItemSchema = new mongoose.Schema<ICartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "product", required: true },
    variantSku: { type: String, required: true },
    quantity: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

export interface ICart {
  userId: Types.ObjectId;
  cartItems: ICartItem[];
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
    cartItems: {
      type: [CartItemSchema],
      required: true,
      default: [],
    },
  },
  { timestamps: true }
);

CartSchema.index({
  userId: 1,
  "cartItems.product": 1,
  "cartItems.variantSku": 1,
});

const Cart = models?.Cart || mongoose.model<ICart>("Cart", CartSchema);

export default Cart;
