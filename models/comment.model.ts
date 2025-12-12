import mongoose, { models, Schema, Types, Document } from "mongoose";

export interface IComment {
  author: Types.ObjectId;
  product: Types.ObjectId;
  review: number;
  content: string;
  verified: boolean;
}
export interface ICommentDoc extends IComment, Document {}

const CommentSchema = new mongoose.Schema<IComment>(
  {
    author: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    review: { type: Number, required: true, min: 1, max: 5 },
    content: { type: String, required: true },
    verified: { type: Boolean, required: true, index: true },
  },
  { timestamps: true }
);

CommentSchema.index({ verified: 1, product: 1 });
CommentSchema.index({ createdAt: -1 });

const Comment =
  models?.Comment || mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;
