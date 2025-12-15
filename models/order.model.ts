import { AddressSchema, IAddress } from "./user.model";
import mongoose, { models, Schema, Types, Document } from "mongoose";

export interface IOrderItem {
  product: Types.ObjectId;
  variantSku: string;
  variantColor?: string;
  variantSize?: string;
  productTitle: string;
  productImage: string;
  priceAtPurchase: number;
  quantity: number;
  subTotal?: number;
}

const OrderItemSchema = new mongoose.Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "product", required: true },
    variantSku: { type: String, required: true },
    variantColor: { type: String },
    variantSize: { type: String },
    productTitle: { type: String, required: true },
    productImage: { type: String, required: true },
    priceAtPurchase: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, default: 1, min: 1 },
    subTotal: { type: Number, min: 0 },
  },
  { _id: false }
);

export interface IPayment {
  method: "visa" | "COD";
  status: "pending" | "completed" | "failed" | "refunded";
  transactionId?: string;
  gatewayResponse?: object;
}

const PaymentSchema = new mongoose.Schema<IPayment>(
  {
    method: {
      type: String,
      enum: ["visa", "COD"],
      default: "COD",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    transactionId: { type: String, required: false, index: true },
    gatewayResponse: { type: Object, required: false },
  },
  { _id: false }
);

interface IPromoCode {
  code: string;
  discount: number;
  discountAmount: number;
}

const PromoCodeSchema = new Schema<IPromoCode>(
  {
    code: { type: String, required: true },
    discount: { type: Number, required: true, min: 0, max: 100 },
    discountAmount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

export interface IOrder {
  userId: Types.ObjectId;
  orderItems: IOrderItem[];
  totalPrice: number;
  status: "pending" | "delivering" | "cancelled" | "delivered";
  shippingAddress: IAddress;
  payment: IPayment;
  shippingCost: number;
  promoCode?: IPromoCode;
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
    orderItems: { type: [OrderItemSchema], required: true, default: [] },
    totalPrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "delivering", "cancelled", "delivered"],
      required: true,
      index: true,
      default: "pending",
    },
    shippingAddress: {
      type: AddressSchema,
      required: true,
    },
    payment: {
      type: PaymentSchema,
      required: true,
    },
    shippingCost: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    promoCode: { type: PromoCodeSchema, required: false },
  },
  { timestamps: true }
);

OrderSchema.index({ createdAt: -1 });
OrderSchema.pre("save", async function () {
  if (!this.orderItems || this.orderItems.length === 0) {
    throw new Error("Order must have at least one item");
  }
});
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });

const Order = models?.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
