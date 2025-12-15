import mongoose, { models, Schema, Types, Document } from "mongoose";

export interface IVariant {
  sku: string;
  color?: string;
  size?: string;
  stock: number;
  image?: string;
}

export const VariantSchema = new Schema<IVariant>(
  {
    sku: { type: String, required: true },
    color: { type: String },
    size: { type: String },
    stock: { type: Number, required: true },
    image: { type: String },
  },
  { _id: false } // VERY IMPORTANT
);

export interface IProduct {
  title: string;
  description: string;
  category: Types.ObjectId[]; // may be snapshooted
  oldPrice?: number;
  newPrice: number;
  variants: IVariant[];
  averageRating: number;
  totalReviews: number;
  images: string[];
  isActive: boolean;
}

export interface IProductDoc extends IProduct, Document {}

export const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },

    category: [
      { type: Schema.Types.ObjectId, ref: "Category", required: true },
    ],
    oldPrice: { type: Number, min: 0 },
    newPrice: { type: Number, min: 0, default: 0, required: true },
    variants: {
      type: [VariantSchema],
      required: true,
      validate: {
        validator: (v: IVariant[]) => v.length > 0,
        message: "Product must have at least one variant",
      },
    },
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

// Indexes
ProductSchema.index({ isActive: 1, createdAt: -1 });
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ "variants.sku": 1 }, { unique: true });

const Product =
  models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
