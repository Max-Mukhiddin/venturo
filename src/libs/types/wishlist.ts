import { ObjectId } from "mongoose";
import { Product } from "./product";

export interface Wishlist {
  _id: ObjectId;
  memberId: ObjectId;
  productId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  //** from aggregations **/
  productData?: Product[];
}

export interface WishlistInput {
  memberId: ObjectId;
  productId: ObjectId;
}
