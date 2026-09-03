import express from "express";
const routerAdmin = express.Router();
import restaurantController from "./controllers/restaurant.controller";
import productController from "./controllers/product.controller";
import makeUploader from "./libs/utils/uploader";
import articleController from "./controllers/article.controller";
import contactController from "./controllers/contact.controller";
import faqController from "./controllers/faq.controller";

/** Restaurant **/
routerAdmin.get("/", restaurantController.goHome);
routerAdmin
  .get("/login", restaurantController.getLogin)
  .post("/login", restaurantController.processLogin);

routerAdmin
  .get("/signup", restaurantController.getSignup)
  .post(
    "/signup",
    makeUploader("members").single("memberImage"),
    restaurantController.processSignup
  );

routerAdmin.get("/logout", restaurantController.logout);

routerAdmin.get("/check-me", restaurantController.checkAuthSession);

/** Product */

routerAdmin.get(
  "/product/all",
  restaurantController.verifyRestaurant,
  productController.getAllProducts
);

routerAdmin.post(
  "/product/create",
  restaurantController.verifyRestaurant,
  makeUploader("products").array("productImages", 5),
  productController.createNewProduct
);

routerAdmin.post(
  "/product/:id",
  restaurantController.verifyRestaurant,
  productController.updateChosenProduct
);
/** User */

routerAdmin.get(
  "/user/all",
  restaurantController.verifyRestaurant,
  restaurantController.getUsers
);

routerAdmin.post(
  "/user/edit",
  restaurantController.verifyRestaurant,
  restaurantController.updateChosenUser
);

/** Article (SSR list/create view, JSON status-update AJAX — see article.controller.ts) */

routerAdmin.get(
  "/article/all",
  restaurantController.verifyRestaurant,
  articleController.getAllArticlesAdmin
);

routerAdmin.post(
  "/article/create",
  restaurantController.verifyRestaurant,
  makeUploader("articles").single("articleImage"),
  articleController.createNewArticle
);

routerAdmin.post(
  "/article/:id",
  restaurantController.verifyRestaurant,
  makeUploader("articles").single("articleImage"),
  articleController.updateChosenArticle
);

/** Contact (JSON-only this pass — no EJS views yet) */

routerAdmin.get(
  "/contact/all",
  restaurantController.verifyRestaurant,
  contactController.getAllContactMessages
);

routerAdmin.post(
  "/contact/:id",
  restaurantController.verifyRestaurant,
  contactController.updateContactMessageStatus
);

/** FAQ (JSON-only) */

routerAdmin.get(
  "/faq/all",
  restaurantController.verifyRestaurant,
  faqController.getAllFAQs
);

routerAdmin.post(
  "/faq/create",
  restaurantController.verifyRestaurant,
  faqController.createFAQ
);

routerAdmin.post(
  "/faq/:id",
  restaurantController.verifyRestaurant,
  faqController.updateFAQ
);

routerAdmin.post(
  "/faq/:id/delete",
  restaurantController.verifyRestaurant,
  faqController.deleteFAQ
);

export default routerAdmin;
