import { ObjectId } from "mongoose";
import { FAQGroup, FAQStatus } from "../enums/faq.enum";

export interface FAQ {
  _id: ObjectId;
  faqQuestion: string;
  faqAnswer: string;
  faqGroup: FAQGroup;
  faqStatus: FAQStatus;
  faqOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FAQInput {
  faqQuestion: string;
  faqAnswer: string;
  faqGroup: FAQGroup;
  faqStatus?: FAQStatus;
  faqOrder: number;
}

export interface FAQUpdateInput {
  faqQuestion?: string;
  faqAnswer?: string;
  faqGroup?: FAQGroup;
  faqStatus?: FAQStatus;
  faqOrder?: number;
}
