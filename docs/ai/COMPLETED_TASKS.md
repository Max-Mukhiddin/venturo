# Completed Tasks — Burak → Venturo Migration

Chronological, grouped by session as they actually occurred in this repository. Commit references are to this repo's actual history: `7b1e0a9 feat: initial setup venturo` (pre-migration baseline) → `9786040 feat: start migration process` (everything from Sessions 2–3 below, committed together).

## Session 1 — Codebase Audit

**Type**: Investigation only. No files changed.

Produced [VENTURO_AUDIT.md](../VENTURO_AUDIT.md): full structure map, tech-stack identification from config files, exhaustive "burak"/"venturo" string search, domain-model inventory (Member/Product/Order/OrderItem/View), completion-state assessment per feature area, and a list of concrete bugs/inconsistencies found (the `if (ProductCollection)` filter bug, the `OrderItem.model..ts` filename typo, the dead `restaurantIid` field, the `signup.js` validator missing `return true`, the `.files(0)` vs `.files[0]` bug, the hardcoded session secret, `src/train.ts` scratch code, and others).

**Validation**: N/A — no code touched.

## Session 2 — Backend Bug Fixes, Dead Code Removal, Domain Rename

**Type**: Code changes, applied in four scoped sections with a typecheck gate after each.

| Section | Files changed | What changed |
|---|---|---|
| 1. Confirmed bug fixes | `src/controllers/product.controller.ts`, `src/public/js/signup.js`, `src/schema/OrderItem.model..ts` → `OrderItem.model.ts` (renamed), `src/models/Order.service.ts`, `src/app.ts` | Fixed the `if (ProductCollection)` → `if (productCollection)` filter bug; added missing `return true;` and fixed `.files(0)` → `.files[0]` in the signup validator; renamed the typo'd schema filename and updated its import; wired `SESSION_SECRET` from `.env` into `express-session`'s `secret` option (was a hardcoded literal). |
| 2. Dead code removal | `src/train.ts` (deleted), `package.json`, `src/views/products.ejs` | Deleted the unrelated algorithm-exercise scratch file and its `npm run train` script; removed the unused, typo'd `restaurantIid` hidden form input. |
| 3. Domain rename | `src/libs/enums/member.enum.ts`, `src/models/Member.service.ts`, `src/controllers/restaurant.controller.ts`, `src/views/signup.ejs`, `src/libs/enums/product.enum.ts`, `src/schema/Product.model.ts`, `src/libs/types/product.ts`, `src/views/includes/header.ejs` | `MemberType.RESTAURANT` → `MemberType.ADMIN` (enum + every comparison/assignment site + form value); `ProductCollection` food categories replaced with adventure/outdoor categories; `ProductVolume` enum, schema field, and index reference removed entirely; `ProductSize` schema default removed (now optional); `<title>Burak</title>` → `<title>Venturo</title>`. |
| 4. Wording/UI sync | `src/views/products.ejs`, `src/public/js/products.js`, `src/views/login.ejs`, `src/views/signup.ejs`, `src/public/js/signup.js`, `src/libs/Errors.ts` | Product-type `<option>` list updated to the new categories; dead DRINK-branch toggle JS removed; "Restaurant *" labels → "Store *"; upload/alert copy and the `BLOCKED_USER` error message updated to match the new domain; "RESTAURANT MENU" → "PRODUCT CATALOG"; "Product Volume" table column → "Product Size". |

**Validation**: `npx tsc --noEmit` run and passed after every one of the four sections above, before proceeding to the next — no section was started while the prior one had an unresolved type error.

## Session 3 — Project Instructions Files

**Type**: Documentation only (repo-root instruction files, not `docs/`).

- Created `CLAUDE.md` at the project root from user-supplied content describing the project, stack, folder map, domain model, and standing rules.
- User subsequently pointed to `AGENTS.md` (identical content) as the canonical instructions file. Both files currently exist in the repo with matching content — flagged as a drift risk (if one is edited later without the other) but left as-is per the user's choice not to remove either.
- A `SKILLS.md` file was also added to the repo (outside this assistant's actions) capturing two working notes: grep for both enum references and bare string literals when renaming enum values, and run `npx tsc --noEmit` after every edit round.

**Validation**: N/A — documentation only.

## Session 4 — ER Model & Storefront Gap Analysis

**Type**: Documentation only. No files changed.

Produced [VENTURO_ER_MODEL.md](../VENTURO_ER_MODEL.md): a Mermaid `erDiagram` of all five current schemas (`Member`, `Product`, `Order`, `OrderItem`, `View`) with every field, type, and relationship cardinality verified against the actual schema files and service-layer query/aggregation code (not assumed) — including calling out that `OrderItem.orderId`/`productId` aren't schema-`required` despite having `ref:`, and that `View.viewRefId` has no real `ref` and is polymorphic by convention only. Followed by a gap analysis against the planned storefront pages (Wishlist, Blog, FAQ, Contact Us, Order Track), a full "Proposed Additions" table covering all ten storefront pages, and nine open product-decision questions.

**Validation**: N/A — documentation only; no schemas were created or modified.

## Session 5 (current) — Migration Documentation Set

**Type**: Documentation only. No files changed.

Created the `docs/` folder and this documentation set (`BACKEND_MIGRATION.md`, `DECISIONS.md`, `COMPLETED_TASKS.md`, `NEXT_STEPS.md`, `PROMPTS.md`), consolidating everything from Sessions 1–4 into a structured reference. All content is grounded in `VENTURO_AUDIT.md`, `VENTURO_ER_MODEL.md`, `AGENTS.md`, and this repo's actual git history — nothing was invented.

**Validation**: `npx tsc --noEmit` re-run immediately before writing this document (confirming Session 2's changes still typecheck cleanly with no regressions introduced by the intervening documentation-only sessions) — **passed, zero errors**. `git status` confirmed the working tree matches commit `9786040` exactly aside from the new, untracked `VENTURO_ER_MODEL.md` and this `docs/` folder — no unexpected or unreviewed source changes exist.

## Session 6 — Product-Related Entity Additions (Wishlist, Article, ContactMessage, Review, Order shipping/status)

**Type**: Code changes, implemented per an approved plan in six scoped phases (enums → types → schemas → services → controllers → routes), with a `tsc --noEmit` gate after every phase, plus a Phase 7 documentation pass.

| Phase | Files changed | What changed |
|---|---|---|
| 1. Enums | `src/libs/enums/order.enum.ts`, `src/libs/enums/article.enum.ts` (new), `src/libs/enums/contact.enum.ts` (new) | `OrderStatus.PAUSE` renamed to `PENDING`; `SHIPPED` inserted between `PROCESS` and `FINISH` (final: `PENDING, PROCESS, SHIPPED, FINISH, DELETE`). Added `ArticleStatus` (`DRAFT`/`PUBLISHED`) and `ArticleCategory` (`GEAR_GUIDES`/`TRIP_REPORTS`/`NEWS`/`TIPS`). Added `ContactMessageStatus` (`NEW`/`READ`). |
| 2. Types | `src/libs/types/order.ts`, `src/libs/types/product.ts`, `src/libs/types/wishlist.ts` (new), `src/libs/types/article.ts` (new), `src/libs/types/contact.ts` (new), `src/libs/types/review.ts` (new) | Added `ShippingAddress` interface and `Order.shippingAddress`; added `CreateOrderInput { shippingAddress, items }` to replace the bare `OrderItemInput[]` request shape. Added `averageRating`/`reviewCount` to the `Product` interface only (deliberately excluded from `ProductInput`/`ProductUpdateInput`). New `Wishlist`, `Article`, `ContactMessage`, `Review` types. |
| 3. Schemas | `src/schema/Order.model.ts`, `src/schema/Product.model.ts`, `src/schema/Wishlist.model.ts` (new), `src/schema/Article.model.ts` (new), `src/schema/ContactMessage.model.ts` (new), `src/schema/Review.model.ts` (new) | `Order` gets a required embedded `shippingAddress` subdocument (street/city/state/zip/country) and its `orderStatus` default changed to `PENDING`. `Product` gets `averageRating`/`reviewCount` (both default 0). `Wishlist` and `Review` each get a compound unique index on `{ memberId: 1, productId: 1 }`. `Article` gets a unique `slug` index. |
| 4. Services | `src/models/Order.service.ts`, `src/models/Product.service.ts`, `src/models/Wishlist.service.ts` (new), `src/models/Article.service.ts` (new), `src/models/ContactMessage.service.ts` (new), `src/models/Review.service.ts` (new) | `OrderService.createOrder` updated for the new `CreateOrderInput` shape. `ProductService.recalculateRating(productId)` added, aggregating `Review` documents (`$avg`/`$sum`) to refresh the cached rating fields. `ReviewService.createReview` is an **upsert** (`findOneAndUpdate` with `upsert: true`) on `{ memberId, productId }` — a repeat submission updates the existing review in place rather than being rejected — and calls `recalculateRating` after every create *and* update. `WishlistService.addToWishlist` handles the unique-index conflict idempotently (returns the existing entry rather than erroring). |
| 5. Controllers | `src/controllers/order.controller.ts`, `src/controllers/wishlist.controller.ts` (new), `src/controllers/article.controller.ts` (new), `src/controllers/contact.controller.ts` (new), `src/controllers/review.controller.ts` (new) | `orderController.createOrder` updated for the new request body shape. New controllers follow the existing `T`-typed-object + try/catch + `Errors` pattern exactly. |
| 6. Routes | `src/router.ts`, `src/router-admin.ts` | New public/customer routes: `GET/POST /wishlist/*`, `GET /article/all`, `GET /article/:slug`, `POST /contact/submit`, `POST /review/create`, `GET /review/product/:id`. New admin routes (JSON-only, no new EJS views): `GET/POST /admin/article/*`, `GET/POST /admin/contact/*`, both guarded by the existing `restaurantController.verifyRestaurant` middleware. |
| 7. Docs | `AGENTS.md`, `docs/ai/NEXT_STEPS.md` | Fixed a remaining stale path in `AGENTS.md`'s Workflow section (`docs/COMPLETED_TASKS.md` → `docs/ai/COMPLETED_TASKS.md`; the "Read First" section's paths were already correct). Added a `NEXT_STEPS.md` Documentation item flagging that Article/ContactMessage still need EJS admin views before a non-technical store owner can use them, and a Testing item flagging `POST /contact/submit` as a public/unauthenticated route that will need rate-limiting before launch. |

**Design decisions made mid-implementation** (confirmed with the user before/during this session, not unilateral): `OrderStatus.PAUSE` was renamed to `PENDING` rather than kept alongside it; `Article.category` uses a fixed enum rather than free text; `Review` got an explicit unique-per-member-per-product constraint enforced via upsert semantics (overriding the plan's original idempotent-no-op default) rather than allowing repeat reviews, specifically to prevent a member manipulating `averageRating` via duplicate submissions; Article/ContactMessage admin management shipped JSON-only, with the EJS gap explicitly logged rather than silently dropped; the `POST /order/create` request-body breaking change was approved since no live client depends on the old shape yet.

**Validation**: `npx tsc --noEmit` run and passed after every one of the six code phases before proceeding to the next. A final grep for the bare string literal `"PAUSE"` confirmed zero remaining references to the retired `OrderStatus.PAUSE` value (the only `"PAUSE"` hits found are the unrelated, still-current `ProductStatus.PAUSE`). No automated test suite exists in this repo (unchanged from prior sessions) — route wiring was verified by reading `router.ts`/`router-admin.ts` back to confirm every new controller method is reachable with the correct auth middleware.

## Session 7 — `ProductService.getProducts` Sort Whitelist & Independent Direction

**Type**: Code changes, scoped to sort logic only (filtering and pagination in `getProducts` untouched).

Prior to this session, `inquiry.order` was an unvalidated raw string used directly as the Mongo `$sort` key, with `productPrice` hardcoded to ascending and every other value — valid field name or not — hardcoded to descending, with no way to request the opposite direction for any field.

| File | Change |
|---|---|
| `src/libs/enums/product.enum.ts` | Added `ProductSortBy` enum: `CREATED_AT` (`"createdAt"`), `PRODUCT_PRICE` (`"productPrice"`), `PRODUCT_VIEWS` (`"productViews"`), `AVERAGE_RATING` (`"averageRating"`), `REVIEW_COUNT` (`"reviewCount"`). |
| `src/libs/types/product.ts` | Added `sortDirection?: "ASC" \| "DESC"` to `ProductInquiry`. `order` stays typed as `string` deliberately — it's raw, unvalidated query-string input; runtime whitelist validation belongs in the service, not the type. |
| `src/models/Product.service.ts` | Replaced the hardcoded ternary with: a whitelist check (`Object.values(ProductSortBy).includes(inquiry.order)`) that falls back to `ProductSortBy.CREATED_AT` for any unrecognized value instead of erroring or accepting an arbitrary field name; and an independent direction resolution (`inquiry.sortDirection` wins if explicitly `"ASC"`/`"DESC"`, otherwise defaults to ascending for `PRODUCT_PRICE` and descending for everything else, preserving prior behavior for callers that don't pass `sortDirection`). |
| `src/controllers/product.controller.ts` | `sortDirection` now read from the query string alongside `order`, only attached to the inquiry if it's exactly `"ASC"` or `"DESC"` (any other value silently dropped, mirroring how `productCollection`/`search` are already conditionally attached). |

**Validation**: `npx tsc --noEmit` — passed, zero errors. Confirmed via `git diff -- src/models/Product.service.ts` that the old 4-line ternary was fully removed (not left alongside the new logic) — the diff shows a clean replacement, no duplicate/dead sort logic remaining.
