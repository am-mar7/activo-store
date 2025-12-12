import mongoose, { models, Schema, Types, Document } from "mongoose";

interface PromoCode {
  code: string;
  discount: number;
}
export interface IOrder {
  userId: Types.ObjectId;
  orderItems: Types.ObjectId[];
  totalPrice: number;
  status: "pending" | "delivering" | "cancelled" | "delivered";
  shippingAddress: Types.ObjectId;
  payment: Types.ObjectId;
  shippingCost: number;
  promoCode?: PromoCode;
}
export interface IOrderDoc extends IOrder, Document {}

const OrderSchema = new mongoose.Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    orderItems: [
      {
        type: Schema.Types.ObjectId,
        ref: "OrderItem",
      },
    ],
    totalPrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "delivering", "cancelled", "delivered"],
      required: true,
      index: true,
      default: "pending",
    },
    shippingAddress: {
      type: Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    payment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },
    shippingCost: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    promoCode: { type: Object, required: false },
  },
  { timestamps: true }
);

OrderSchema.index({ createdAt: -1 });
OrderSchema.pre("save", async function () {
  if (!this.orderItems || this.orderItems.length === 0) {
    throw new Error("Order must have at least one item");
  }
});

const Order = models?.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
