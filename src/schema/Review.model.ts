import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Member",
    },

    productId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ memberId: 1, productId: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
