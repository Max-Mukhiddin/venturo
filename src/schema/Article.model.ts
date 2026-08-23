import mongoose, { Schema } from "mongoose";
import { ArticleCategory, ArticleStatus } from "../libs/enums/article.enum";

const articleSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      required: true,
      index: { unique: true },
    },

    content: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: ArticleCategory,
      required: true,
    },

    status: {
      type: String,
      enum: ArticleStatus,
      default: ArticleStatus.DRAFT,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Article", articleSchema);
