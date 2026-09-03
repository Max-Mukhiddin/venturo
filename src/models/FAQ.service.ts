import { shapeIntoMongooseIdObjectId } from "../libs/config";
import { FAQGroup, FAQStatus } from "../libs/enums/faq.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { FAQ, FAQInput, FAQUpdateInput } from "../libs/types/faq";
import FAQModel from "../schema/FAQ.model";

class FAQService {
  private readonly faqModel;

  constructor() {
    this.faqModel = FAQModel;
  }

  /** Public */
  public async getFAQs(): Promise<FAQ[]> {
    return await this.faqModel
      .aggregate([
        { $match: { faqStatus: FAQStatus.ACTIVE } },
        {
          $addFields: {
            faqGroupOrder: {
              $switch: {
                branches: [
                  { case: { $eq: ["$faqGroup", FAQGroup.SHOPPING] }, then: 1 },
                  { case: { $eq: ["$faqGroup", FAQGroup.ACCOUNT_SUPPORT] }, then: 2 },
                ],
                default: 99,
              },
            },
          },
        },
        { $sort: { faqGroupOrder: 1, faqOrder: 1, _id: 1 } },
        { $project: { _id: 1, faqQuestion: 1, faqAnswer: 1, faqGroup: 1, faqOrder: 1 } },
      ])
      .exec();
  }

  /** Admin */
  public async getAllFAQs(): Promise<FAQ[]> {
    return await this.faqModel.find().sort({ faqGroup: 1, faqOrder: 1, _id: 1 }).exec();
  }

  public async createFAQ(input: FAQInput): Promise<FAQ> {
    this.validateInput(input, false);
    try {
      return await this.faqModel.create(input);
    } catch (err) {
      console.log("Error, model:createFAQ:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async updateFAQ(id: string, input: FAQUpdateInput): Promise<FAQ> {
    this.validateInput(input, true);
    const faqId = shapeIntoMongooseIdObjectId(id);
    const result = await this.faqModel
      .findByIdAndUpdate(faqId, input, { new: true, runValidators: true })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    return result;
  }

  public async deleteFAQ(id: string): Promise<FAQ> {
    const faqId = shapeIntoMongooseIdObjectId(id);
    const result = await this.faqModel.findByIdAndDelete(faqId).exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    return result;
  }

  private validateInput(input: FAQInput | FAQUpdateInput, isUpdate: boolean) {
    const hasQuestion = Object.prototype.hasOwnProperty.call(input, "faqQuestion");
    const hasAnswer = Object.prototype.hasOwnProperty.call(input, "faqAnswer");
    const hasGroup = Object.prototype.hasOwnProperty.call(input, "faqGroup");
    const hasStatus = Object.prototype.hasOwnProperty.call(input, "faqStatus");
    const hasOrder = Object.prototype.hasOwnProperty.call(input, "faqOrder");

    if (!isUpdate && (!hasQuestion || !hasAnswer || !hasGroup || !hasOrder)) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
    if (hasQuestion) input.faqQuestion = this.validateText(input.faqQuestion, isUpdate);
    if (hasAnswer) input.faqAnswer = this.validateText(input.faqAnswer, isUpdate);
    if (hasGroup && !Object.values(FAQGroup).includes(input.faqGroup as FAQGroup)) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATE_FAILED);
    }
    if (hasStatus && !Object.values(FAQStatus).includes(input.faqStatus as FAQStatus)) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATE_FAILED);
    }
    if (hasOrder) input.faqOrder = this.validateOrder(input.faqOrder, isUpdate);
  }

  private validateText(value: unknown, isUpdate: boolean): string {
    if (typeof value !== "string" || !value.trim()) {
      throw new Errors(HttpCode.BAD_REQUEST, isUpdate ? Message.UPDATE_FAILED : Message.CREATE_FAILED);
    }
    return value.trim();
  }

  private validateOrder(value: unknown, isUpdate: boolean): number {
    if (typeof value === "string" && value.trim()) value = Number(value);
    if (typeof value !== "number" || !Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
      throw new Errors(HttpCode.BAD_REQUEST, isUpdate ? Message.UPDATE_FAILED : Message.CREATE_FAILED);
    }
    return value;
  }
}

export default FAQService;
