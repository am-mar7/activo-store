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
  { _id: false }
);

export interface IProduct {
  title: string;
  description: string;
  category: Types.ObjectId[]; // may be snapshooted
  oldPrice?: number;
  newPrice: number;
  stock?: number;
  variants?: IVariant[];
  collection: "winter" | "summer" | "both";
  averageRating: number;
  totalReviews: number;
  sold: number;
  images: string[];
  sizeGuide?: string;
  isActive: boolean;
}

export interface IProductDoc extends IProduct, Omit<Document, "collection"> {}

export const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },

    category: [
      { type: Schema.Types.ObjectId, ref: "Category", required: true },
    ],
    oldPrice: { type: Number, min: 0 },
    newPrice: { type: Number, min: 0, default: 0, required: true },
    variants: { type: [VariantSchema] },
    stock: { type: Number, min: 0 },
    collection: {
      type: String,
      enum: ["winter", "summer", "both"],
      required: true,
    },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    sold: { type: Number, default: 0, required: true },

    images: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "Product must have at least one image",
      },
    },

    sizeGuide: {
      type: String,
      required: false,
      default: null,
    },

    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

ProductSchema.path("variants").validate(function (
  this: IProductDoc,
  variants: IVariant[]
) {
  const hasVariants = variants && variants.length > 0;
  const hasStock = this.stock !== undefined && this.stock !== null;

  if (!hasVariants && !hasStock) return false;
  if (hasVariants && hasStock) return false;

  return true;
},
"Product must have either variants or a stock value, not both");

// Indexes
ProductSchema.index({ isActive: 1, createdAt: -1 });
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ "variants.sku": 1 }, { unique: true, sparse: true });

const Product =
  models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
