import mongoose, { models, Document, Types, Schema } from "mongoose";

export interface ICategory {
  parentId?: Types.ObjectId;
  name: string;
  image: string;
  slug: string;
  isActive: boolean;
}
export interface ICategoryDoc extends ICategory, Document {}

const CategorySchema = new mongoose.Schema<ICategory>(
  {
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: false,
      index: true,
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

CategorySchema.index({ parentId: 1, isActive: 1 });

const Category =
  models?.Category || mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
