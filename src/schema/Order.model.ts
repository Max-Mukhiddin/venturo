import mongoose, { Schema } from "mongoose";
import { OrderStatus, PaymentMethod } from "../libs/enums/order.enum";

const orderSchema = new Schema(
  {
    orderTotal: {
      type: Number,
      required: true,
    },
    orderDelivery: {
      type: Number,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: OrderStatus,
      default: OrderStatus.PENDING,
    },
    orderPaymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
      default: PaymentMethod.PAY_ON_DELIVERY,
    },
    memberId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Member",
    },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
      country: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
