import { ObjectId } from "mongoose";

export interface Review {
  _id: ObjectId;
  memberId: ObjectId;
  productId: ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewInput {
  productId: ObjectId;
  rating: number;
  comment?: string;
}
