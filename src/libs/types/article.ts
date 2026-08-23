import { ObjectId } from "mongoose";
import { ArticleCategory, ArticleStatus } from "../enums/article.enum";

export interface Article {
  _id: ObjectId;
  title: string;
  slug: string;
  content: string;
  category: ArticleCategory;
  status: ArticleStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ArticleInput {
  title: string;
  slug: string;
  content: string;
  category: ArticleCategory;
  status?: ArticleStatus;
}

export interface ArticleUpdateInput {
  _id: ObjectId;
  title?: string;
  content?: string;
  category?: ArticleCategory;
  status?: ArticleStatus;
}
