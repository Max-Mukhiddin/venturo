import { Request, Response } from "express";
import Errors, { HttpCode } from "../libs/Errors";
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

/** Admin (JSON-only this pass) */

articleController.getAllArticlesAdmin = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("getAllArticlesAdmin");
    const result = await articleService.getAllArticles();

    res.status(HttpCode.OK).json(result);
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
    const result = await articleService.createNewArticle(input);

    res.status(HttpCode.CREATED).json(result);
  } catch (err) {
    console.log("Error, createNewArticle:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
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

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, updateChosenArticle:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

export default articleController;
