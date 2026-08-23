import { shapeIntoMongooseIdObjectId } from "../libs/config";
import { ProductSortBy, ProductStatus } from "../libs/enums/product.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import {
  Product,
  ProductInput,
  ProductInquiry,
  ProductUpdateInput,
} from "../libs/types/product";
import ProductModel from "../schema/Product.model";
import ReviewModel from "../schema/Review.model";
import { ObjectId } from "mongoose";
import ViewService from "./View.service";
import { ViewInput } from "../libs/types/view";
import { ViewGroup } from "../libs/enums/view.enum";

class ProductService {
  private readonly productModel;
  public viewService;

  constructor() {
    this.productModel = ProductModel;
    this.viewService = new ViewService();
  }
  /** SPA */

  public async getProducts(inquiry: ProductInquiry): Promise<Product[]> {
    const match: T = { productStatus: ProductStatus.PROCESS };

    if (inquiry.productCollection)
      match.productCollection = inquiry.productCollection;
    if (inquiry.search) {
      match.productName = { $regex: new RegExp(inquiry.search, "i") };
    }

    const sortField = (
      Object.values(ProductSortBy) as string[]
    ).includes(inquiry.order)
      ? (inquiry.order as ProductSortBy)
      : ProductSortBy.CREATED_AT;

    const defaultDirection = sortField === ProductSortBy.PRODUCT_PRICE ? 1 : -1;
    const direction =
      inquiry.sortDirection === "ASC"
        ? 1
        : inquiry.sortDirection === "DESC"
        ? -1
        : defaultDirection;

    const sort: T = { [sortField]: direction };

    const result = await this.productModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        { $skip: (inquiry.page * 1 - 1) * inquiry.limit },
        { $limit: inquiry.limit * 1 },
      ])
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  public async getProduct(
    memberId: ObjectId | null,
    id: string
  ): Promise<Product> {
    const productId = shapeIntoMongooseIdObjectId(id);

    let result = await this.productModel
      .findOne({ _id: productId, productStatus: ProductStatus.PROCESS })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    if (memberId) {
      // check existanse
      const input: ViewInput = {
        memberId: memberId,
        viewRefId: productId,
        viewGroup: ViewGroup.PRODUCT,
      };
      const existView = await this.viewService.checkViewExistance(input);

      console.log("exist:", !!existView);
      if (!existView) {
        // insert  view
        console.log("Planning to insert new view");
        await this.viewService.insertMemberView(input);
      

      // increase counts
      result = await this.productModel
        .findByIdAndUpdate(
          productId,
          { $inc: { productViews: +1 } },
          { new: true }
        )
        .exec();
    }
  }
    return result;
  }


  /** SSR */

  public async getAllProducts(): Promise<Product[]> {
    const result = await this.productModel.find().exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }

  public async createNewProduct(input: ProductInput): Promise<Product> {
    try {
      const result = await this.productModel.create(input);
      return result;
    } catch (err) {
      console.error("Error, model:createNewProduct:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async updateChosenProduct(
    id: string,
    input: ProductUpdateInput
  ): Promise<Product> {
    // string => objectId
    id = shapeIntoMongooseIdObjectId(id);
    const result = await this.productModel
      .findByIdAndUpdate({ _id: id }, input, { new: true })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

    console.log("result:", result);
    return result;
  }

  public async recalculateRating(productId: ObjectId): Promise<void> {
    const result = await ReviewModel.aggregate([
      { $match: { productId: shapeIntoMongooseIdObjectId(productId) } },
      {
        $group: {
          _id: "$productId",
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]).exec();

    const averageRating = result[0]?.averageRating ?? 0;
    const reviewCount = result[0]?.reviewCount ?? 0;

    await this.productModel
      .findByIdAndUpdate(productId, { averageRating, reviewCount })
      .exec();
  }
}

export default ProductService;
