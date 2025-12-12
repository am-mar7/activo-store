import mongoose, { models, Schema, Types, Document } from "mongoose";

export interface IProductVariant {
  product: Types.ObjectId;
  sku: string;
  color: string;
  size: string;
  stock: number;
}
export interface IProductVariantDoc extends IProductVariant, Document {}

const ProductVariantSchema = new mongoose.Schema<IProductVariant>(
  {
    product: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Product",
      index: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true, // auto indexing
    },
    color: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

ProductVariantSchema.index({ createdAt: -1, product: 1 });
ProductVariantSchema.index({ createdAt: -1 });
ProductVariantSchema.index({ product: 1, color: 1, size: 1 }, { unique: true });

const ProductVariant =
  models?.ProductVariant ||
  mongoose.model<IProductVariant>("ProductVariant", ProductVariantSchema);

export default ProductVariant;
