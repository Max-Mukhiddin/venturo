import { shapeIntoMongooseIdObjectId } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { Member } from "../libs/types/member";
import { Wishlist } from "../libs/types/wishlist";
import WishlistModel from "../schema/Wishlist.model";

class WishlistService {
  private readonly wishlistModel;

  constructor() {
    this.wishlistModel = WishlistModel;
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
            localField: "productId",
            foreignField: "_id",
            as: "productData",
          },
        },
      ])
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  public async addToWishlist(
    member: Member,
    productId: string
  ): Promise<Wishlist> {
    const memberId = shapeIntoMongooseIdObjectId(member._id);
    const productObjectId = shapeIntoMongooseIdObjectId(productId);

    try {
      return await this.wishlistModel.create({
        memberId: memberId,
        productId: productObjectId,
      });
    } catch (err) {
      // already wishlisted — idempotent, return the existing entry
      const existing = await this.wishlistModel
        .findOne({ memberId: memberId, productId: productObjectId })
        .exec();
      if (existing) return existing;

      console.log("Error, model:addToWishlist:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async removeFromWishlist(
    member: Member,
    productId: string
  ): Promise<void> {
    const memberId = shapeIntoMongooseIdObjectId(member._id);
    const productObjectId = shapeIntoMongooseIdObjectId(productId);

    await this.wishlistModel
      .deleteOne({ memberId: memberId, productId: productObjectId })
      .exec();
  }
}

export default WishlistService;
