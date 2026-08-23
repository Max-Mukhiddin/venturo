---
name: product-logic
description: Review Venturo product API consistency across REST routes, controllers, services, schemas, enums, filters, and remaining legacy terminology.
---

# Venturo Product API Review

Use this skill for review-only passes or pre-edit analysis of the product API.

## Review Checklist

- Confirm REST routes and response payloads use product terminology:
  - `GET /product/all`
  - `GET /product/:id`
  - and where else product data is returned or written
- Confirm shared features such as View tracking and Wishlist correctly
  reference productId and return real product data.
- Confirm `src/libs/types/product.ts`, `src/schema/Product.model.ts`, and
  `src/libs/enums/product.enum.ts` agree on product fields and
  optionality — e.g. productSize is optional, not required.
- Confirm filters use productCollection, productSize, price range, and
  search term — never a leftover food-domain field.
- Confirm no bare string literals of old enum values (DISH, SALAD,
  DESSERT, DRINK, RESTAURANT) remain anywhere — only enum references.
- Report real findings with file paths and behavior impact. This is
  review-only — don't fix anything in this pass.