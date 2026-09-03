import { shapeIntoMongooseIdObjectId } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { Member } from "../libs/types/member";
import { Wishlist, WishlistAddResult } from "../libs/types/wishlist";
import { ProductStatus } from "../libs/enums/product.enum";
import ProductModel from "../schema/Product.model";
import WishlistModel from "../schema/Wishlist.model";
import mongoose, { ObjectId } from "mongoose";

class WishlistService {
  private readonly wishlistModel;
  private readonly productModel;

  constructor() {
    this.wishlistModel = WishlistModel;
    this.productModel = ProductModel;
  }

  public async getMyWishlist(member: Member): Promise<Wishlist[]> {
    const memberId = shapeIntoMongooseIdObjectId(member._id);

    const result = await this.wishlistModel
      .aggregate([
        { $match: { memberId: memberId } },
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: "products",
            let: { wishlistProductId: "$productId" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$wishlistProductId"] },
                  productStatus: ProductStatus.PROCESS,
                },
              },
              {
                $project: {
                  _id: 1,
                  productName: 1,
                  productPrice: 1,
                  productImages: 1,
                  productCollection: 1,
                  productLeftCount: 1,
                  productStatus: 1,
                  productViews: 1,
                  averageRating: 1,
                  reviewCount: 1,
                },
              },
            ],
            as: "productData",
          },
        },
        { $match: { "productData.0": { $exists: true } } },
      ])
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  public async addToWishlist(
    member: Member,
    productId: string
  ): Promise<WishlistAddResult> {
    const memberId = shapeIntoMongooseIdObjectId(member._id);
    const productObjectId = this.getProductObjectId(productId);

    const product = await this.productModel
      .findOne({ _id: productObjectId, productStatus: ProductStatus.PROCESS })
      .select("_id")
      .exec();
    if (!product) throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);

    try {
      const wishlist = await this.wishlistModel.create({ memberId, productId: productObjectId });
      return { wishlist, created: true };
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        const existing = await this.wishlistModel
          .findOne({ memberId: memberId, productId: productObjectId })
          .exec();
        if (existing) return { wishlist: existing, created: false };
      }

      console.log("Error, model:addToWishlist:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async removeFromWishlist(
    member: Member,
    productId: string
  ): Promise<boolean> {
    const memberId = shapeIntoMongooseIdObjectId(member._id);
    const productObjectId = this.getProductObjectId(productId);

    const result = await this.wishlistModel
      .deleteOne({ memberId: memberId, productId: productObjectId })
      .exec();
    return result.deletedCount === 1;
  }

  private getProductObjectId(productId: string): ObjectId {
    if (typeof productId !== "string" || !mongoose.isValidObjectId(productId)) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
    return shapeIntoMongooseIdObjectId(productId);
  }
}

export default WishlistService;
