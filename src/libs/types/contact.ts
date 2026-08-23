import { ObjectId } from "mongoose";
import { ContactMessageStatus } from "../enums/contact.enum";

export interface ContactMessage {
  _id: ObjectId;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactMessageInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactMessageUpdateInput {
  _id: ObjectId;
  status: ContactMessageStatus;
}
