import express from "express";
const router = express.Router();
import memberController from "./controllers/member.controller";
import uploader from "./libs/utils/uploader";
import productController from "./controllers/product.controller";
import orderController from "./controllers/order.controller";
import wishlistController from "./controllers/wishlist.controller";
import articleController from "./controllers/article.controller";
import contactController from "./controllers/contact.controller";
import reviewController from "./controllers/review.controller";
import faqController from "./controllers/faq.controller";
/** Member **/
router.get("/member/restaurant", memberController.getRestaurant);
router.post("/member/login", memberController.login);
router.post("/member/signup", memberController.signup);
router.post(
  "/member/logout",
  memberController.verifyAuth,
  memberController.logout
);
router.get(
  "/member/detail",
  memberController.verifyAuth,
  memberController.getMemberDetail
);
router.post(
  "/member/update",
  memberController.verifyAuth,
  uploader("members").single("memberImage"),
  memberController.updateMember
);
router.get("/member/top-users", memberController.getTopUsers);

/** Product **/

router.get("/product/all", productController.getProducts);
router.get(
  "/product/:id",
  memberController.retrieveAuth,
  productController.getProduct
);

/** Order **/

router.post(
  "/order/create",
  memberController.verifyAuth,
  orderController.createOrder
);
router.get(
  "/order/all",
  memberController.verifyAuth,
  orderController.getMyOrders
);
router.post(
  "/order/update",
  memberController.verifyAuth,
  orderController.updateOrder
);

/** Wishlist **/

router.get(
  "/wishlist/all",
  memberController.verifyAuth,
  wishlistController.getMyWishlist
);
router.post(
  "/wishlist/add",
  memberController.verifyAuth,
  wishlistController.addWishlistItem
);
router.post(
  "/wishlist/remove",
  memberController.verifyAuth,
  wishlistController.removeWishlistItem
);

/** Article **/

router.get("/article/all", articleController.getArticles);
router.get("/article/:slug", articleController.getArticle);

/** Contact **/

router.post("/contact/submit", contactController.submitContactMessage);

/** FAQ **/

router.get("/faq/all", faqController.getFAQs);

/** Review **/

router.post(
  "/review/create",
  memberController.verifyAuth,
  reviewController.createReview
);
router.get("/review/product/:id", reviewController.getProductReviews);

export default router;
