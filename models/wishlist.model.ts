import mongoose, { models, Schema, Types, Document } from "mongoose";

export interface IWishlist {
  userId: Types.ObjectId;
  product: Types.ObjectId;
}
export interface IWishlistDoc extends IWishlist, Document {}

const WishlistSchema = new mongoose.Schema<IWishlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      index: true,
      required: true,
    },
  },
  { timestamps: true }
);

WishlistSchema.index({ userId: 1, product: 1 }, { unique: true });

const Wishlist =
  models?.Wishlist || mongoose.model<IWishlist>("Wishlist", WishlistSchema);

export default Wishlist;
