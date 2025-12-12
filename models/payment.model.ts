import mongoose, { models, Schema, Types, Document } from "mongoose";

export interface IPayment {
  orderId: Types.ObjectId;
  method: "visa" | "COD";
  status: "pending" | "completed" | "failed" | "refunded";
  transactionId?: string;
  gatewayResponse?: object;
}
export interface IPaymentDoc extends IPayment, Document {}

const PaymentSchema = new mongoose.Schema<IPayment>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Order",
      unique: true, // auto indexing
    },
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
  { timestamps: true }
);

const Payment =
  models?.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;
