import mongoose, { models, Schema, Types, Document } from "mongoose";

export interface IOrderItem {
  orderId: Types.ObjectId;
  variant: Types.ObjectId;
  priceAtPurchase: number;
  quantity: number;
  subTotal?: number;
}
export interface IOrderItemDoc extends IOrderItem, Document {}

const OrderItemSchema = new mongoose.Schema<IOrderItem>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Order",
      index: true,
    },
    variant: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "ProductVariant",
    },
    priceAtPurchase: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, default: 1, min: 1 },
    subTotal: { type: Number, min: 0 },
  },
  { timestamps: true }
);

OrderItemSchema.pre("save", async function () {
  this.subTotal = this.priceAtPurchase * this.quantity;
});

const OrderItem =
  models?.OrderItem || mongoose.model<IOrderItem>("OrderItem", OrderItemSchema);

export default OrderItem;
