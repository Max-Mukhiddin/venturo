import { Request, Response } from "express";
import Errors, { HttpCode } from "../libs/Errors";
import { T } from "../libs/types/common";
import {
  ContactMessageInput,
  ContactMessageUpdateInput,
} from "../libs/types/contact";
import ContactMessageService from "../models/ContactMessage.service";

const contactMessageService = new ContactMessageService();
const contactController: T = {};

contactController.submitContactMessage = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("submitContactMessage");
    const input: ContactMessageInput = req.body;
    const result = await contactMessageService.submitMessage(input);

    res.status(HttpCode.CREATED).json(result);
  } catch (err) {
    console.log("Error, submitContactMessage:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

contactController.getAllContactMessages = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("getAllContactMessages");
    const result = await contactMessageService.getAllMessages();

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getAllContactMessages:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

contactController.updateContactMessageStatus = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("updateContactMessageStatus");
    const id = req.params.id;
    const input: ContactMessageUpdateInput = req.body;
    const result = await contactMessageService.updateMessageStatus(id, input);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, updateContactMessageStatus:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

export default contactController;
