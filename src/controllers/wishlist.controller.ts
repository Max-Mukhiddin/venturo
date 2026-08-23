import { Request, Response } from "express";
import Errors, { HttpCode } from "../libs/Errors";
import { T } from "../libs/types/common";
import { ExtendedRequest } from "../libs/types/member";
import WishlistService from "../models/Wishlist.service";

const wishlistService = new WishlistService();
const wishlistController: T = {};

wishlistController.getMyWishlist = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("getMyWishlist");
    const result = await wishlistService.getMyWishlist(req.member);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getMyWishlist:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

wishlistController.addWishlistItem = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("addWishlistItem");
    const { productId } = req.body;
    const result = await wishlistService.addToWishlist(req.member, productId);

    res.status(HttpCode.CREATED).json(result);
  } catch (err) {
    console.log("Error, addWishlistItem:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

wishlistController.removeWishlistItem = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("removeWishlistItem");
    const { productId } = req.body;
    await wishlistService.removeFromWishlist(req.member, productId);

    res.status(HttpCode.OK).json({ removed: true });
  } catch (err) {
    console.log("Error, removeWishlistItem:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

export default wishlistController;
