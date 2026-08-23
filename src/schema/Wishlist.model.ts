import mongoose, { Schema } from "mongoose";

const wishlistSchema = new Schema(
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
  },
  { timestamps: true }
);

wishlistSchema.index({ memberId: 1, productId: 1 }, { unique: true });

export default mongoose.model("Wishlist", wishlistSchema);
