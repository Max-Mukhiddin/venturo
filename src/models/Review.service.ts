import { shapeIntoMongooseIdObjectId } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { Member } from "../libs/types/member";
import { Review, ReviewInput } from "../libs/types/review";
import ReviewModel from "../schema/Review.model";
import ProductService from "./Product.service";

class ReviewService {
  private readonly reviewModel;
  private readonly productService;

  constructor() {
    this.reviewModel = ReviewModel;
    this.productService = new ProductService();
  }

  public async createReview(
    member: Member,
    input: ReviewInput
  ): Promise<Review> {
    const memberId = shapeIntoMongooseIdObjectId(member._id);
    const productId = shapeIntoMongooseIdObjectId(input.productId);

    try {
      // upsert: one review per member per product — a repeat submission
      // updates the existing review in place instead of being rejected.
      const result = await this.reviewModel
        .findOneAndUpdate(
          { memberId: memberId, productId: productId },
          { rating: input.rating, comment: input.comment },
          { new: true, upsert: true }
        )
        .exec();

      await this.productService.recalculateRating(productId);

      return result;
    } catch (err) {
      console.log("Error, model:createReview:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async getProductReviews(productId: string): Promise<Review[]> {
    const productObjectId = shapeIntoMongooseIdObjectId(productId);

    const result = await this.reviewModel
      .find({ productId: productObjectId })
      .sort({ createdAt: -1 })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }
}

export default ReviewService;
