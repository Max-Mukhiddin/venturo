import { Request, Response } from "express";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import { ArticleInput, ArticleUpdateInput } from "../libs/types/article";
import ArticleService from "../models/Article.service";

const articleService = new ArticleService();
const articleController: T = {};

/** Public */

articleController.getArticles = async (req: Request, res: Response) => {
  try {
    console.log("getArticles");
    const result = await articleService.getArticles();

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getArticles:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

articleController.getArticle = async (req: Request, res: Response) => {
  try {
    console.log("getArticle");
    const { slug } = req.params;
    const result = await articleService.getArticle(slug);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getArticle:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

/** Admin — SSR list/create view, same pattern as product.controller.ts's
 *  getAllProducts/createNewProduct/updateChosenProduct (plain form POST +
 *  inline-script redirect for create, JSON `{ data }` for the AJAX status
 *  update). Was JSON-only with no EJS view; both endpoints' response
 *  shapes changed here to match that convention exactly, not just the
 *  admin listing itself. */

articleController.getAllArticlesAdmin = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("getAllArticlesAdmin");
    const data = await articleService.getAllArticles();

    res.render("articles", { articles: data });
  } catch (err) {
    console.log("Error, getAllArticlesAdmin:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

articleController.createNewArticle = async (req: Request, res: Response) => {
  try {
    console.log("createNewArticle");
    const input: ArticleInput = req.body;
    await articleService.createNewArticle(input);

    res.send(
      `<script> alert("Successful creation!"); window.location.replace('/admin/article/all')</script>`
    );
  } catch (err) {
    console.log("Error, createNewArticle:", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script> alert("${message}"); window.location.replace('/admin/article/all')</script>`
    );
  }
};

articleController.updateChosenArticle = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("updateChosenArticle");
    const id = req.params.id;
    const input: ArticleUpdateInput = req.body;
    const result = await articleService.updateChosenArticle(id, input);

    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("Error, updateChosenArticle:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

export default articleController;
