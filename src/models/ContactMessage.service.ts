import { shapeIntoMongooseIdObjectId } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import {
  ContactMessage,
  ContactMessageInput,
  ContactMessageUpdateInput,
} from "../libs/types/contact";
import ContactMessageModel from "../schema/ContactMessage.model";

class ContactMessageService {
  private readonly contactMessageModel;

  constructor() {
    this.contactMessageModel = ContactMessageModel;
  }

  public async submitMessage(
    input: ContactMessageInput
  ): Promise<ContactMessage> {
    try {
      return await this.contactMessageModel.create(input);
    } catch (err) {
      console.log("Error, model:submitMessage:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async getAllMessages(): Promise<ContactMessage[]> {
    const result = await this.contactMessageModel
      .find()
      .sort({ createdAt: -1 })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  public async updateMessageStatus(
    id: string,
    input: ContactMessageUpdateInput
  ): Promise<ContactMessage> {
    const messageId = shapeIntoMongooseIdObjectId(id);
    const result = await this.contactMessageModel
      .findByIdAndUpdate(messageId, { status: input.status }, { new: true })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    return result;
  }
}

export default ContactMessageService;
