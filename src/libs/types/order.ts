import { ObjectId } from "mongoose";
import { OrderStatus, PaymentMethod } from "../enums/order.enum";
import { Product } from "./product";

export interface OrderItem {
  _id: ObjectId;
  itemQuantity: number;
  itemPrice: number;
  orderId: ObjectId;
  productId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Order {
  _id: ObjectId;
  orderTotal: number;
  orderDelivery: number;
  orderStatus: OrderStatus;
  orderPaymentMethod: PaymentMethod;
  memberId: ObjectId;
  shippingAddress: ShippingAddress;
  createdAt: Date;
  updatedAt: Date;
  //** from aggregations **/
  orderItems: OrderItem[];
  productData: Product[];
}

export interface OrderItemInput {
  itemQuantity: number;
  // Accepted for legacy clients but never used to calculate order prices.
  itemPrice?: number;
  productId: ObjectId | string;
  orderId?: ObjectId;
}

export interface CreateOrderInput {
  shippingAddress: ShippingAddress;
  items: OrderItemInput[];
  orderPaymentMethod?: PaymentMethod;
}

export interface OrderInquiry {
  page: number;
  limit: number;
  orderStatus?: OrderStatus;
}

export interface OrderUpdateInput {
    orderId: string;
    orderStatus: OrderStatus;
}
