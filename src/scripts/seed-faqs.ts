import dotenv from "dotenv";
import mongoose from "mongoose";
import { FAQGroup, FAQStatus } from "../libs/enums/faq.enum";
import FAQModel from "../schema/FAQ.model";

dotenv.config();

const faqs = [
  [FAQGroup.SHOPPING, 1, "What is Venturo?", "Venturo is an outdoor marketplace for browsing products and gear across categories such as climbing, camping, hiking, trekking, cycling, apparel, and footwear."],
  [FAQGroup.SHOPPING, 2, "How do I find a product?", "Use the Shop page search, collection filters, and sorting controls to narrow the catalogue and open any product for more details."],
  [FAQGroup.SHOPPING, 3, "How do I add a product to my basket?", "Use the Add To Cart button on a product card or product detail page. The basket keeps the selected product and quantity while you continue browsing."],
  [FAQGroup.SHOPPING, 4, "What happens if a product is out of stock?", "Products with no available stock cannot be added to the basket until stock becomes available again."],
  [FAQGroup.SHOPPING, 5, "Can I browse products by category?", "Yes. Venturo supports outdoor collections including climbing, camping, hiking, trekking, cycling, apparel, footwear, and other gear."],
  [FAQGroup.ACCOUNT_SUPPORT, 1, "Do I need an account to browse Venturo?", "No. You can browse products without signing in. Some account and order actions may require authentication."],
  [FAQGroup.ACCOUNT_SUPPORT, 2, "How can I view my account information?", "Sign in and open the account area to access the account features currently available to you."],
  [FAQGroup.ACCOUNT_SUPPORT, 3, "What should I do if my account is blocked?", "A blocked account cannot use protected Venturo features. Use the Contact page to request assistance."],
  [FAQGroup.ACCOUNT_SUPPORT, 4, "How can I contact Venturo?", "Open the Contact page and submit the contact form. Venturo uses the existing contact submission flow to receive the message."],
  [FAQGroup.ACCOUNT_SUPPORT, 5, "Where can I find more information about a product?", "Open the product detail page to view the product information currently available for that listing."],
] as const;

const seedFAQs = async () => {
  if (process.env.FAQ_SEED_CONFIRM !== "true") throw new Error("Set FAQ_SEED_CONFIRM=true to seed FAQs.");
  if (!process.env.MONGO_URL) throw new Error("MONGO_URL is required.");

  await mongoose.connect(process.env.MONGO_URL);
  try {
    await Promise.all(
      faqs.map(([faqGroup, faqOrder, faqQuestion, faqAnswer]) =>
        FAQModel.updateOne(
          { faqGroup, faqQuestion },
          { $set: { faqGroup, faqOrder, faqQuestion, faqAnswer, faqStatus: FAQStatus.ACTIVE } },
          { upsert: true, runValidators: true }
        ).exec()
      )
    );
    console.log(`FAQ seed complete: ${faqs.length} records ensured.`);
  } finally {
    await mongoose.disconnect();
  }
};

seedFAQs().catch((err) => {
  console.error("FAQ seed failed:", err);
  process.exitCode = 1;
});
