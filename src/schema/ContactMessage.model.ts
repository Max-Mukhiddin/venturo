import mongoose, { Schema } from "mongoose";
import { ContactMessageStatus } from "../libs/enums/contact.enum";

const contactMessageSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    subject: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ContactMessageStatus,
      default: ContactMessageStatus.NEW,
    },
  },
  { timestamps: true, collection: "contactMessages" }
);

export default mongoose.model("ContactMessage", contactMessageSchema);
