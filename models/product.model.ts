import mongoose, { models, Schema, Types, Document } from "mongoose";

export interface IProduct {
  title: string;
  description: string;
  category: Types.ObjectId[];
  oldPrice?: number;
  newPrice: number;
  averageRating: number;
  totalReviews: number;
  images: string[];
  isActive: boolean;
}
export interface IProductDoc extends IProduct, Document {}

const ProductSchema = new mongoose.Schema<IProduct>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: [Schema.Types.ObjectId],
      ref: "Category",
      required: true,
    },
    oldPrice: { type: Number, required: false },
    newPrice: { type: Number, required: true },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    images: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "Product must have at least one image",
      },
    },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

ProductSchema.index({ isActive: 1, createdAt: -1 });
ProductSchema.index({ category: 1, isActive: 1 });

const Product =
  models?.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
