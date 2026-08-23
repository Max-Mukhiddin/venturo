import { Request, Response } from "express";
import Errors, { HttpCode } from "../libs/Errors";
import { T } from "../libs/types/common";
import { ExtendedRequest } from "../libs/types/member";
import { ReviewInput } from "../libs/types/review";
import ReviewService from "../models/Review.service";

const reviewService = new ReviewService();
const reviewController: T = {};

reviewController.createReview = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("createReview");
    const input: ReviewInput = req.body;
    const result = await reviewService.createReview(req.member, input);

    res.status(HttpCode.CREATED).json(result);
  } catch (err) {
    console.log("Error, createReview:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

reviewController.getProductReviews = async (req: Request, res: Response) => {
  try {
    console.log("getProductReviews");
    const { id } = req.params;
    const result = await reviewService.getProductReviews(id);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getProductReviews:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

export default reviewController;
