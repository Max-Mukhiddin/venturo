import { Request, Response } from "express";
import Errors, { HttpCode } from "../libs/Errors";
import { T } from "../libs/types/common";
import { FAQInput, FAQUpdateInput } from "../libs/types/faq";
import FAQService from "../models/FAQ.service";

const faqService = new FAQService();
const faqController: T = {};

/** Public */

faqController.getFAQs = async (req: Request, res: Response) => {
  try {
    console.log("getFAQs");
    const result = await faqService.getFAQs();

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getFAQs:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

/** Admin */

faqController.getAllFAQs = async (req: Request, res: Response) => {
  try {
    console.log("getAllFAQs");
    const result = await faqService.getAllFAQs();

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getAllFAQs:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

faqController.createFAQ = async (req: Request, res: Response) => {
  try {
    console.log("createFAQ");
    const input: FAQInput = req.body;
    const result = await faqService.createFAQ(input);

    res.status(HttpCode.CREATED).json(result);
  } catch (err) {
    console.log("Error, createFAQ:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

faqController.updateFAQ = async (req: Request, res: Response) => {
  try {
    console.log("updateFAQ");
    const input: FAQUpdateInput = req.body;
    const result = await faqService.updateFAQ(req.params.id, input);

    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("Error, updateFAQ:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

faqController.deleteFAQ = async (req: Request, res: Response) => {
  try {
    console.log("deleteFAQ");
    const result = await faqService.deleteFAQ(req.params.id);

    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("Error, deleteFAQ:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

export default faqController;
