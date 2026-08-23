import { shapeIntoMongooseIdObjectId } from "../libs/config";
import { ArticleStatus } from "../libs/enums/article.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import {
  Article,
  ArticleInput,
  ArticleUpdateInput,
} from "../libs/types/article";
import ArticleModel from "../schema/Article.model";

class ArticleService {
  private readonly articleModel;

  constructor() {
    this.articleModel = ArticleModel;
  }

  /** Public */

  public async getArticles(): Promise<Article[]> {
    const result = await this.articleModel
      .find({ status: ArticleStatus.PUBLISHED })
      .sort({ createdAt: -1 })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  public async getArticle(slug: string): Promise<Article> {
    const result = await this.articleModel
      .findOne({ slug: slug, status: ArticleStatus.PUBLISHED })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  /** Admin */

  public async getAllArticles(): Promise<Article[]> {
    const result = await this.articleModel.find().sort({ createdAt: -1 }).exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  public async createNewArticle(input: ArticleInput): Promise<Article> {
    try {
      return await this.articleModel.create(input);
    } catch (err) {
      console.log("Error, model:createNewArticle:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async updateChosenArticle(
    id: string,
    input: ArticleUpdateInput
  ): Promise<Article> {
    const articleId = shapeIntoMongooseIdObjectId(id);
    const result = await this.articleModel
      .findByIdAndUpdate(articleId, input, { new: true })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    return result;
  }
}

export default ArticleService;
