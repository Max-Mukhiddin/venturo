import { Request, Response } from "express";
import { T } from "../libs/types/common";

/**
 * TEMPORARY STUB — created only to unblock `tsc`/the dev server, which
 * failed to start because router.ts/router-admin.ts already reference
 * this module for an in-progress FAQ feature (see package.json's
 * `seed:faqs` script and src/router*.ts) whose real controller/service/
 * schema don't exist yet. Not part of the Article-feature task this
 * file was added under — flagged in docs/ai/NEXT_STEPS.md for whoever
 * is building the real FAQ feature to replace.
 */

const faqController: T = {};

faqController.getFAQs = async (req: Request, res: Response) => {
  res.status(501).json({ message: "FAQ feature not yet implemented" });
};

faqController.getAllFAQs = async (req: Request, res: Response) => {
  res.status(501).json({ message: "FAQ feature not yet implemented" });
};

faqController.createFAQ = async (req: Request, res: Response) => {
  res.status(501).json({ message: "FAQ feature not yet implemented" });
};

faqController.updateFAQ = async (req: Request, res: Response) => {
  res.status(501).json({ message: "FAQ feature not yet implemented" });
};

faqController.deleteFAQ = async (req: Request, res: Response) => {
  res.status(501).json({ message: "FAQ feature not yet implemented" });
};

export default faqController;
