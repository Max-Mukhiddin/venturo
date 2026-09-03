import mongoose, { Schema } from "mongoose";
import { FAQGroup, FAQStatus } from "../libs/enums/faq.enum";

const faqSchema = new Schema(
  {
    faqQuestion: { type: String, required: true, trim: true },
    faqAnswer: { type: String, required: true, trim: true },
    faqGroup: { type: String, enum: FAQGroup, required: true },
    faqStatus: { type: String, enum: FAQStatus, default: FAQStatus.ACTIVE },
    faqOrder: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "FAQ order must be an integer.",
      },
    },
  },
  { timestamps: true }
);

faqSchema.index({ faqGroup: 1, faqQuestion: 1 }, { unique: true });

export default mongoose.model("FAQ", faqSchema);
