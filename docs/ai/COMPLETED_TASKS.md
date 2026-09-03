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

## Session 8 — `OrderStatus` Filter Whitelist, `ContactMessage` Status Fix, Full 32-Endpoint Runtime Validation

**Type**: Two targeted bug fixes plus a full live-endpoint validation pass against a running server and the dev database (documented in detail in `docs/ai/API_REFERENCE.md`, Section 5).

| Fix | Files changed | What changed |
|---|---|---|
| `orderStatus` query-param whitelist | `src/libs/Errors.ts`, `src/controllers/order.controller.ts` | Same class of bug as the product sort fix: `GET /order/all`'s `orderStatus` was a bare `as OrderStatus` type assertion with no runtime check, so a stale/invalid value (e.g. `"PAUSE"`) silently matched zero orders. Added `Message.INVALID_ORDER_STATUS`; the controller now rejects a present-but-invalid `orderStatus` with `400`, while an *omitted* `orderStatus` is left alone (see next row). |
| `POST /admin/contact/:id` hardcoded to `READ` | `src/models/ContactMessage.service.ts`, `src/controllers/contact.controller.ts` | `updateMessageStatus` hardcoded `status: ContactMessageStatus.READ` regardless of the request body; `ContactMessageUpdateInput`'s `status` field was defined but never read. Now takes `(id, input: ContactMessageUpdateInput)` and writes `input.status`, so an admin can genuinely set `NEW` or `READ`. |
| `GET /order/all` no-filter bug (found *during* the validation pass below, then fixed) | `src/models/Order.service.ts` | `OrderService.getMyOrders` built `{ memberId, orderStatus: inquiry.orderStatus }` unconditionally; when `orderStatus` was omitted this still carried the key with a literal `undefined` value, and an aggregation `$match` stage doesn't strip `undefined` keys the way Mongoose's `.find()` does — so "no filter" matched on `orderStatus: undefined` and returned `[]` instead of all the member's orders. Fixed by building `matches` as `T` and only adding `orderStatus` when `inquiry.orderStatus` is truthy. |

**Full runtime validation pass**: all 32 endpoints documented in `docs/ai/API_REFERENCE.md` were hit with real requests against a running server (`ts-node src/server.ts`) and the dev database — not inferred from source reading. **32/32 passed** after the `GET /order/all` fix above (it was the one failure found, and is the fix described in this session). This was the first live test of `Article`'s full lifecycle (create → publish → publicly visible on both `GET /article/all` and `GET /article/:slug`) and of all 9 admin-session-gated routes (`/admin/product/all`, `/admin/product/:id`, `/admin/user/all`, `/admin/user/edit`, `/admin/article/*`, `/admin/contact/*`), none of which had been runtime-verified before. Full request/response detail is in `API_REFERENCE.md` rather than duplicated here.

Two operational blockers surfaced and were worked around, not fixed: `uploads/members`/`uploads/products` don't exist on a fresh checkout (already logged in `docs/ai/NEXT_STEPS.md`'s Known Bugs section) and had to be `mkdir -p`'d before any image upload would succeed; and admin-gated routes initially couldn't be tested because a real `ADMIN` account already existed in the dev DB with unknown credentials — the user supplied the password directly rather than a new admin being created, since the system is single-tenant and a second admin signup is correctly rejected.

**Validation**: `npx tsc --noEmit` — passed, zero errors, after each of the two fixes. The `GET /order/all` fix was additionally confirmed live: the same pre-existing order that previously returned `[]` on an unfiltered request now returns correctly, with matching-filter, non-matching-filter, and invalid-filter (400) cases all re-checked afterward with no regression. Server stopped and all local temp files removed after testing; `git status` confirmed no stray files or unintended source changes. Test data (`qa_`-prefixed member, product, article, contact message, order) was intentionally left in the dev database per the user's instruction, not cleaned up this session.

## Frontend (venturo-react) Sessions

# Completed Tasks — Burak-React → Venturo-React Frontend Migration

Chronological, grouped by session. This is this repo's own completed-tasks
log — separate from the backend's `../venturo/docs/ai/COMPLETED_TASKS.md`.
Tracks execution against the plan in this session's approved migration
plan (Phase 0–6, plus flagged follow-ups for Wishlist/Blog/Review UI).

## Session — Phase 0: Contract & Config Stabilization

**Type**: Code changes, no visual/theming work. Verified with
`npx tsc --noEmit`, `npm run build`, and a live browser smoke test
(Playwright against the running dev server + live backend).

| Change | File(s) | What changed |
|---|---|---|
| API URL port fix | `.env` | `REACT_APP_API_URL` was `http://localhost:3003`; backend's own `.env` sets `PORT = 3005`. Every API call was hitting the wrong port. Fixed to `http://localhost:3005`. |
| `OrderStatus` enum rename | `src/lib/enums/order.enum.ts` | `PAUSE` → `PENDING`; `SHIPPED` inserted between `PROCESS` and `FINISH`. Matches the backend's current `OrderStatus` (`PENDING, PROCESS, SHIPPED, FINISH, DELETE`). |
| `OrderStatus.PAUSE` call-site fix | `src/app/screens/ordersPage/index.tsx` | Two references (`orderInquiry` initial state, the paused-orders fetch) updated to `OrderStatus.PENDING` so the app still compiles/functions after the enum rename — copy/label re-theming for this screen is still Phase 5, not done here. |
| `CreateOrderInput` contract | `src/lib/types/order.ts` | Added `ShippingAddress { street, city, state, zip, country }` and `CreateOrderInput { shippingAddress, items: OrderItemInput[] }`, matching the backend's `POST /order/create` body shape (it now requires a `shippingAddress`, not a bare item array). |
| `OrderService.createOrder` signature | `src/app/services/OrderService.ts` | Now takes `(input: CartItem[], shippingAddress: ShippingAddress)` and POSTs `{ shippingAddress, items }` instead of a bare `OrderItemInput[]`. |
| Temporary placeholder call site | `src/app/components/headers/Basket.tsx` | `proceedOrderHandler` now passes a placeholder empty `ShippingAddress` to `createOrder`, marked `TODO(Phase 4 — checkout)`. This unblocks the typecheck/build now; the real address form is Phase 4's job — this placeholder must be replaced there, not left in place. |
| Duplicate `id` fix | `src/app/components/auth/index.tsx` | Every `TextField` shared `id="outlined-basic"` (found live during Phase 0's login verification, see below). Gave each field a unique, purpose-tied id: `signup-nick`, `signup-phone`, `signup-password`, `login-nick`, `login-password`. |

**Verification**:
- `npx tsc --noEmit` — zero errors.
- `npm run build` — succeeds (exit 0). Note: `CI=true npm run build` fails on pre-existing ESLint warnings — **65 warnings across 23 files**, none introduced by Phase 0. Full itemized list moved to `docs/ai/NEXT_STEPS.md` (an earlier draft of this entry under-counted this as "~15 files"; corrected here). This is a real risk on any CI platform that sets `CI=true` automatically, not a non-issue — tracked as a follow-up, not fixed in Phase 0.
- **Live smoke test**, backend running on `localhost:3005`, dev server on `localhost:3000`, driven with a real headless Chromium instance via a cached Playwright install (`require()`'d directly from `~/.npm/_npx/.../node_modules/playwright`, since neither `chromium-cli` nor an npm-installed Playwright/Puppeteer was available in this environment — no fallback to curl-only checks; scripts and raw output are preserved in the session transcript, not committed to the repo):
  - Confirmed backend CORS is enabled and credential-compatible: `../venturo/src/app.ts` has `app.use(cors({ credentials: true, origin: true }))` — `origin: true` reflects the request origin per-request, which is required (not `origin: "*"`) for `withCredentials: true` requests to succeed with cookies. No CORS errors appeared in the real browser console.
  - All API calls from the browser correctly hit `localhost:3005` (not `3003`), all `200`.
  - Homepage and Products page render; category filter buttons (all 8: CLIMBING/CAMPING/HIKING/TREKKING/CYCLING/APPAREL/FOOTWEAR/OTHER) present and functional.
  - **Product count corrected**: initial unfiltered `GET /product/all` returning `[]` was mis-read as "zero products in the DB." A direct `db.products.countDocuments({})` against the same `MONGO_URL` the backend's `.env` uses (via the backend's own installed `mongodb` driver, since this frontend repo has no `MONGO_URL`/DB access of its own — it's a pure REST client) found **1 product** ("QA Test Trekking Poles", `productStatus: "PAUSE"`, `productCollection: "TREKKING"`). The public `GET /product/all` correctly excludes non-`PROCESS` products (per the backend's own `DECISIONS.md` #4) — so the empty list was correct filtering behavior, not missing data or a broken fetch. Also confirmed via the `members` collection that this DB is the same one referenced in the backend's test history (`qa_tester_002`, `memberPoints: 1`, present).
  - **Login round-trip confirmed live**, using `qa_tester_002` / `TestPass123!`: `POST /member/login` → `200`, `accessToken`/`connect.sid` cookies set, `localStorage.memberData` populated, navbar switches to the authenticated avatar state, and the auth-gated `/orders` route renders (not redirected to `/`) showing the real profile (nickname, `USER` type, address). Product browsing while authenticated (`/products`) also confirmed.
    - First attempt at this test produced a false-negative `404` — traced to the test script's own selector, not the app at the time: `getByLabel("username"/"password")` landed on the wrong field because every `TextField` in `components/auth/index.tsx` shared the identical `id="outlined-basic"`. Retested with position/type-based selectors to confirm the underlying login flow worked; the duplicate-`id` bug itself was then fixed (see table above) and **re-verified with `getByLabel` directly — now resolves the correct field with no workaround needed**: `POST /member/login` → `200`, `connect.sid`/`accessToken` cookies set, same authenticated round-trip confirmed. Removed from `docs/ai/NEXT_STEPS.md` now that it's fixed and re-verified.
  - **Incidental finding, deferred to Phase 1 and fixed there** (see below): `src/app/screens/homePage/ActiveUsers.tsx:30`'s missing-image fallback bug.

**Not done in this session** (explicitly out of Phase 0's scope, per the plan): no visual/theming changes, no `/checkout` route or screen (Phase 4), no re-theme of `ordersPage`'s "Paused" tab labels (Phase 5).

## Session — Phase 1: Homepage (functional-only pass)

**Type**: One bug fix. Per explicit instruction, this pass skips all
CSS/theming, copy, and asset-swap work for every phase — a separate later
session with design skills loaded handles that. Everything Phase 1 in the
original plan called for was visual/copy work (hero copy, stats, video ad,
event copy) and is deferred to `docs/ai/NEXT_STEPS.md`'s new "Visual pass
— not yet done" section, untouched here.

| Change | File(s) | What changed |
|---|---|---|
| Missing-image fallback fix | `src/app/screens/homePage/ActiveUsers.tsx` | `imagePath` now falls back to `/icons/default-user.svg` when `member.memberImage` is unset, matching the existing pattern in `HomeNavbar.tsx`. Previously built `${serverApi}/undefined`, which the browser blocked (`ERR_BLOCKED_BY_ORB`) — flagged during Phase 0's live verification. |

**Verification**:
- `npx tsc --noEmit` — zero errors.
- `npm run build` — succeeds (exit 0).
- Live check (Playwright, real headless Chromium): loaded `/`, confirmed zero failed requests (previously one `FAILED GET http://localhost:3005/undefined`), and confirmed the `ActiveUsers` card's `<img>` now renders `src="/icons/default-user.svg"` for `qa_tester_002` (the only top user, who has no `memberImage`).

**Not done in this session** (deferred to a later visual-design pass, see `docs/ai/NEXT_STEPS.md`): `HomeNavbar.tsx` hero copy, `Statistics.tsx` stats/labels, `Advertisement.tsx` video asset, any remaining `Events.tsx`/`plans.ts` copy, the `burak.svg` logo reference.

## Session — Phase 2: Products List (functional-only pass)

**Type**: One logic bug fix. Category filters, search, sort, and the page
title were already contract-fixed in an earlier commit (`6ae04fe`) — this
session's job was to live-verify that wiring against the real backend and
fix any actual logic bugs found, not re-theme.

| Change | File(s) | What changed |
|---|---|---|
| Pagination "phantom next page" fix | `src/app/screens/productsPage/Products.tsx` | `Pagination`'s `count` was `products.length !== 0 ? page + 1 : page` — always offered one more page than the current one, even when the current page had already returned fewer items than `limit` (i.e., was genuinely the last page). The backend's `GET /product/all` returns no total-count field, so there's no authoritative page count to read — fixed using the one signal that is available client-side: `count = products.length === limit ? page + 1 : page`. A full page still offers a tentative next page (unavoidable without backend support); a short page now correctly stops offering one. |

**Verification**:
- `npx tsc --noEmit` — zero errors.
- `npm run build` — succeeds (exit 0).
- Live check (Playwright, real headless Chromium) against `/products`:
  - All 8 category buttons (CLIMBING/CAMPING/HIKING/TREKKING/CYCLING/APPAREL/FOOTWEAR/OTHER) send correct `productCollection` query values.
  - Search box (type + Enter) sends a correctly URL-encoded `search` param; the clear (×) button resets it.
  - All three sort buttons (NEW/PRICE/VIEWS) send the correct `order` value.
  - **Pagination fix confirmed live with 0 results**: the control renders only page `1` with the next-page button disabled, instead of the old bug's phantom enabled next page.
  - Zero failed requests, zero console errors throughout.

**Full-page → short-page transition, re-verified with real data (follow-up)**: the dev DB had only 1 product total at the time of the check above (`PAUSE` status, not even publicly visible), so the transition itself hadn't been observed, only code-reviewed. 5 `qa_`-tagged `PROCESS`-status test products were added directly to MongoDB (`qa_pagination_test_1` CAMPING/$45, `_2` HIKING/$60, `_3` APPAREL/$30, `_4` CAMPING/$55, `_5` CAMPING/$65 — 3 of the 5 share the CAMPING category, since the UI's category buttons are the only way to view a filtered subset and each of 3 lone categories alone wouldn't have enough volume). This went through direct DB insertion, not `POST /admin/product/create` — the two existing `ADMIN` accounts' credentials aren't known/documented anywhere in this repo or the backend's, and creating a third is blocked by the single-tenant constraint; confirmed with the user this fallback was acceptable, so the real admin endpoint/auth/multer path was **not** exercised, only `GET /product/all` + the frontend's pagination logic.

`Products.tsx`'s `limit` was temporarily changed from `8` to `2` (no UI control exists to adjust it) to make the transition observable with a small dataset, then reverted immediately after — confirmed via `git diff` that only the real pagination fix remains, and `tsc`/build re-run clean post-revert.

Real click-through result, filtering to CAMPING (3 `PROCESS` products, `limit=2`):
- Page 1: `GET /product/all/?...&page=1&limit=2&productCollection=CAMPING` → 2 products, pagination shows `["1", "2"]`, next-page button **enabled**.
- Clicked next → Page 2: `GET /product/all/?...&page=2&limit=2&productCollection=CAMPING` → 1 product (`qa_pagination_test_1`), next-page button **correctly disabled** — screenshotted, confirmed visually (the `→` arrow greyed out vs. the active `←`).

The `qa_pagination_test_1`–`_5` products are left in the dev database intentionally, matching the backend's own prior-session convention for `qa_`-tagged test data — not cleaned up.

**Not done in this session** (deferred to a later visual-design pass, see `docs/ai/NEXT_STEPS.md`): `products.css`/grid imagery re-theme, the "Our Family Brands" Burak-image section, the "Our address" placeholder map section.

## Session — Phase 3: Product Detail (functional-only pass)

**Type**: Two fixes — the planned rating-wiring fix, plus one additional
latent bug found while in the file per the standing "flag, don't ignore
what's sitting right there" rule.

| Change | File(s) | What changed |
|---|---|---|
| Real rating fields on `Product` type | `src/lib/types/product.ts` | Added `averageRating: number` and `reviewCount: number` — both genuinely exist on the backend schema (added in the backend's Session 6) but were missing from this frontend's `Product` interface entirely. |
| Wired real rating display | `src/app/screens/productsPage/ChosenProduct.tsx` | `<Rating defaultValue={2.5} precision={0.5} />` (hardcoded, and — since it had no `readOnly`/controlled `value` — silently interactive with no submit handler, i.e. a second decorative/misleading control) replaced with `<Rating value={chosenProduct.averageRating ?? 0} precision={0.5} readOnly />`. Now reads real backend data and can no longer be clicked to show a fake, unsubmitted rating change. |
| Stale-product-on-navigation bug (found, not planned) | `src/app/screens/productsPage/ChosenProduct.tsx` | The data-fetch `useEffect` had `productsId` read via closure but an empty `[]` dependency array — if a future feature ever links from one product detail page directly to another (no such link exists today, so currently dormant/unreachable, but React Router v5 does *not* remount this component on a params-only route change), the page would keep showing the previous product's data forever. Added `productsId` to the dependency array. Did **not** add the `setChosenProduct`/`setRestaurant` dispatch-wrapper functions the ESLint rule also flags — those are reconstructed on every render by this file's `actionDispatch(useDispatch())` pattern, so including them would refetch on every render instead of only when the id changes; that's pre-existing lint debt already tracked in `docs/ai/NEXT_STEPS.md`'s ESLint section, not part of this fix. |

**Explicitly not built** (per instruction): a review-*submission* UI (`POST /review/create`) — a new feature, not a fix to existing UI, out of scope for this pass.

**Verification**:
- `npx tsc --noEmit` — zero errors.
- `npm run build` — succeeds (exit 0).
- Live check (Playwright, real headless Chromium) against `qa_pagination_test_4` (0 reviews at the time): rating renders `aria-label="0 Stars"`, 0 filled star icons, 0 `<input type=radio>` elements present (confirms genuinely read-only, not just visually static) — the empty-state path renders correctly, no crash, no fallback to the old hardcoded `2.5`.
- **End-to-end confirmation**: logged in as `qa_tester_002` (real credentials from Phase 0), submitted a real review via `POST /review/create` (`rating: 4`, `qa_`-tagged comment) — `201 Created`. Reloaded the product detail page: rating now renders `aria-label="4 Stars"`, screenshot confirms 4 filled / 1 empty star. The review is left in place as `qa_`-tagged test data, matching this repo's established convention for such data (see Phase 2).

**Not done in this session** (deferred to a later visual-design pass, see `docs/ai/NEXT_STEPS.md`): `ChosenProduct.tsx`/`products.css` re-theme; `reviewCount` is now on the `Product` type but not yet surfaced in the UI (no "(N reviews)" label) — available for a future targeted addition, not built since it wasn't asked for.

## Session — Phase 4: Cart / Checkout (functional-only pass)

**Type**: New page + two existing files rewired. Highest-risk phase so
far — the previous "dropdown → immediate order" pattern was already
confirmed hard-broken by Phase 0 (backend requires `shippingAddress`,
which nothing collected), so this replaces it with a real checkout step
per the plan's locked decisions.

| Change | File(s) | What changed |
|---|---|---|
| New checkout screen | `src/app/screens/checkoutPage/index.tsx` (new) | Single page — address form (street/city/state/zip/country, all required, never pre-filled from `Member.memberAddress` per the locked decision, since that field is free-text and doesn't match the backend's structured `ShippingAddress` shape) + order summary (items, delivery-fee-inclusive total, same calc as `Basket.tsx`) + one submit button. Auth-gated the same way `ordersPage`/`userPage` already are (`if (!authMember) history.push("/")`). Empty-cart state shows a plain message instead of a broken form. No custom CSS file — relies on MUI component defaults only, deliberately, since this pass is functional-only. |
| Route wired | `src/app/App.tsx` | Added `/checkout` → `CheckoutPage`, passed `cartItems`/`onDeleteAll` (same props `Basket.tsx` already receives). |
| Basket simplified | `src/app/components/headers/Basket.tsx` | `proceedOrderHandler` no longer calls `OrderService.createOrder` (removed the now-unused import), no longer calls `onDeleteAll()`, no longer pushes to `/orders` — it now just does `history.push("/checkout")`. The `authMember` check was **kept** (not explicitly named in the instructions as something to preserve, but removing it would have silently regressed the UX: an unauthenticated user clicking "Order" would previously get an immediate clear "Please login first!" toast; without the check they'd instead flash through to `/checkout` and get silently bounced back to `/` with no message, since the new page has its own auth-redirect. Flagging this as a deliberate small preservation, not scope creep — happy to remove it if unintended.) |
| Phase 0's placeholder removed | `src/app/components/headers/Basket.tsx` | The `TODO(Phase 4)`-marked empty placeholder `ShippingAddress` (`street: "", city: "", ...`) that Phase 0 left in `createOrder`'s call site is gone entirely, along with the call itself — the real address now comes from `CheckoutPage`'s form. |

**Explicitly not touched** (per instruction): the decorative payment-card `<input>` fields in `ordersPage/index.tsx:136-157` — unrelated to this phase, Phase 5's job.

**Verification**:
- `npx tsc --noEmit` — zero errors.
- `npm run build` — succeeds (exit 0). Also confirmed via a `CI=true` build that the new `checkoutPage/index.tsx` introduces zero new ESLint warnings, and `App.tsx`/`Basket.tsx`'s existing warnings are unchanged in kind (same pre-existing ones, no new ones added by this session's edits).
- **Full live end-to-end flow** (Playwright, real headless Chromium, real backend, real `qa_tester_002` login):
  1. Logged in — confirmed authed UI state.
  2. Added 2 real products to cart from `/products` (CAMPING category, `qa_pagination_test_4`/`_5`) via the actual "add to cart" button — confirmed cart badge shows `2` and `localStorage.cartData` holds both real items.
  3. Opened the basket dropdown, clicked "Order" — confirmed it navigated to `/checkout` **and that zero `POST /order/create` calls had fired yet** (proving the create-order call genuinely moved out of `Basket.tsx`, not just UI navigation).
  4. Filled a real address (street/city/state/zip/country) on `/checkout` — screenshotted.
  5. Submitted — `POST /order/create` returned **`201`** with the real created order: `orderTotal: 120`, `orderDelivery: 0` (correct — $55 + $65 = $120, at/above the $100 free-shipping threshold), `orderStatus: "PENDING"` (confirms Phase 0's enum rename is live end-to-end), and the exact submitted `shippingAddress` echoed back.
  6. Confirmed the cart was **genuinely** cleared, not just visually: `localStorage.cartData` → `null` (not just an empty array), cart badge → `0`.
  7. Landed on `/orders`, screenshotted: the new order appears under the (still old-labeled, Phase-5-scoped) "PAUSED ORDERS" tab showing "Product price $120 + Delivery cost $0 = Total $120" — matching the created order exactly.
  - Only console errors seen were pre-existing MUI `findDOMNode`/StrictMode deprecation warnings from `AuthenticationModal`, a component untouched by this session.

**Failure-path verification (follow-up, live-tested)**: the happy path alone doesn't prove `onDeleteAll()`/the `/orders` redirect are correctly gated on actual success rather than just "the button was clicked" — tested both explicitly, real backend, real login:
- **Blank address**: submitted `/checkout` with all 5 fields empty. Result: **0** `POST /order/create` calls fired (client-side `Object.values(address).every(...)` check blocks before any network request — confirms validation is client-side, not "POST and let the backend 400"), a real SweetAlert error (`"Please fulfill all inputs!"`) rendered on screen (not swallowed), user stayed on `/checkout`, `localStorage.cartData` byte-for-byte unchanged before vs. after.
- **Partial address**: filled Street/City/State/Zip, left Country blank. Identical result — 0 network calls, same error shown, stayed on `/checkout`, cart unchanged. Confirms the check catches a single missing field, not just "all blank."
- Both screenshotted; the partial-address screenshot shows the error modal open with the form data still intact underneath and the cart badge still reading `1`.
- **Code-path confirmation matching the live result**: `submitOrderHandler`'s validation throw happens *before* `order.createOrder(...)` is ever called, and `onDeleteAll()`/`setOrderBuilder`/`history.push("/orders")` all sit *after* that `await` inside the same `try` block — so any failure (client-side validation throw, or a hypothetical backend rejection) skips straight to the `catch`, which only calls `sweetErrorHandling`. There is no code path that reaches `onDeleteAll()` without a real `201` from `order.createOrder` resolving first.
- Not exercised: a genuine backend-side rejection (client validation requires all 5 fields non-empty by the same rule the backend enforces, so there's no way to pass client validation while still failing the backend's schema check through the actual UI — would require bypassing the form entirely, which wouldn't be testing this screen's real code path).

**Other bugs found while in these files**: none beyond what's already fixed above — no additional hardcoded values or broken logic noticed in `App.tsx`/`Basket.tsx` outside the scope of this phase's own changes.

**Not done in this session** (deferred to a later visual-design pass, see `docs/ai/NEXT_STEPS.md`): all styling/layout for the new checkout page (currently bare MUI defaults).

## Session — Phase 5 & 6: Orders/Account + Help Page (functional-only pass)

**Type**: Combined phases — data-accuracy fix, dead-code removal, one more
latent bug found via the standing "flag what's sitting right there" rule,
and wiring the Help page's contact form to the real backend. Last phase
of the functional-only round.

### Phase 5 — Orders / Account

| Change | File(s) | What changed |
|---|---|---|
| Stale tab label fixed | `src/app/screens/ordersPage/index.tsx` | `OrderStatus.PAUSE` was renamed to `PENDING` back in Phase 0, but the visible tab label still read "PAUSED ORDERS" — a data-accuracy issue, not decoration. Changed to "PENDING ORDERS". The `PausedOrders.tsx` component file/identifiers (`pausedOrders`, `setPausedOrders`, `retrievePausedOrders`, etc.) were **not** renamed — doing so would touch the component file, `slice.ts`, `selector.ts`, and `ordersPage/index.tsx`'s import, for a purely internal naming concern with no user-facing effect; judged as "touches many other files" and skipped per the explicit option to do so. |
| Dead payment-card UI removed | `src/app/screens/ordersPage/index.tsx` | Removed the entire non-functional `card-box` `<Stack>` (card-number/expiry/CVV/name `<input>`s plus the four card-brand icons below them) — dead decoration with nothing to connect to now that Phase 4 built a real checkout. Removed the whole block, not just the `<input>`s named in the instructions, since the brand-icon row made no sense as an orphaned leftover once its inputs were gone. |
| `memberType` badge logic | — | Not rebuilt, per instruction — only live-verified (see below). |

**Additional bug found while in these files (not planned, fixed per the standing rule)**: `src/app/screens/ordersPage/FinishedOrders.tsx` had no null/empty-image guard on its product data, unlike `PausedOrders.tsx` and `ProcessOrders.tsx`, which both already have one (with a `// Add safety checks here` comment suggesting the gap was previously noticed but never carried over to this file). A finished order whose product has no images — exactly the shape of every `qa_pagination_test_*` product used in this session's own testing — would either crash (`Cannot read properties of undefined`) or render a blocked `${serverApi}/undefined` image request. Added the same guard used in the other two tabs.

### Phase 6 — Help Page

| Change | File(s) | What changed |
|---|---|---|
| Contact form wired to the real backend | `src/app/screens/helpPage/index.tsx`, `src/app/services/ContactService.ts` (new), `src/lib/types/contact.ts` (new) | The form was `action="#"` with no `onSubmit` — a pure no-op. Added `ContactMessageInput` type and a `ContactService.submitMessage` following the existing `MemberService`/`OrderService`/`ProductService` axios-wrapper pattern, `POST`ing to `/contact/submit`. The existing form (name/email/message) was missing a **Subject** field entirely — the backend's `ContactMessage` schema requires `subject` (`required: true`), so a field had to be added for this to work at all, not just re-wired; this is a functional necessity of "wire the form to work," not scope creep. Validation and success/failure surfacing follow the exact pattern used in `checkoutPage`'s submit handler (client-side all-fields-non-empty check, `sweetErrorHandling`/`sweetTopSuccessAlert`). Form resets to empty on success. |

**Explicitly skipped** (per instruction): FAQ/Terms copy re-theming.

**Verification**:
- `npx tsc --noEmit` — zero errors.
- `npm run build` — succeeds (exit 0).
- **Full live order lifecycle** (Playwright, real headless Chromium, real backend, real `qa_tester_002` login): placed a real order via the Phase 4 checkout → confirmed it appeared under the now-correctly-labeled "PENDING ORDERS" tab → clicked "Payment" (real `window.confirm` accepted) → `POST /order/update` → `200`/`201`, order moved to `orderStatus: "PROCESS"`, tab auto-switched to "PROCESS ORDERS" → clicked "Verify to Fulfil" → another real `POST /order/update` → order moved to `orderStatus: "FINISH"`, tab auto-switched to "FINISHED ORDERS" — and critically, **rendered without crashing** despite the order's product having empty `productImages`, confirming the `FinishedOrders.tsx` fix actually works against the exact condition that would have broken it.
- Badge/profile check: `qa_tester_002` (a `USER`, not `ADMIN`) correctly rendered `/icons/user-badge.svg` and the "USER" label — existing contract-fix logic confirmed still correct, not rebuilt.
- `card-box` element count on the page: **0** — confirmed the dead payment UI is genuinely gone, not just visually hidden.
- **Contact form, live-tested twice with real backend proof**:
  - First isolated test: `POST /contact/submit` → `201`, SweetAlert "Message sent!" shown, form reset to empty, and a direct `db.contactMessages` query confirmed the real document landed with the exact submitted content.
  - A combined run (order lifecycle immediately followed by a contact-form submission, in one script) initially *appeared* to fail silently in this session's live testing — no SweetAlert observed, no request logged by the test script. Investigated rather than dismissed: a direct DB query on that same run showed the document had, in fact, landed correctly — the real `POST /contact/submit` succeeded; only the test script's own response-listener/UI-assertion failed to observe it. The combined flow was then reproduced twice more from a clean run, checking `db.contactMessages.countDocuments({})` immediately before and after each: **3 → 4** and (a further rerun) **3 → 4** again, both times exactly one new correctly-content-matching document, both times a real SweetAlert success shown and observed cleanly. No reproducible app-level defect — the original anomaly was confirmed to be a test-instrumentation gap, not application behavior, based on the database evidence itself rather than a guess.

**Not done in this session** (deferred to a later visual-design pass): FAQ/Terms copy, `PausedOrders.tsx` file/identifier rename (see above), any further styling of `ordersPage`/`helpPage`.

## Session — Missing `productImages` Guard: Full Sweep (third occurrence of a repeat bug)

**Type**: Bug fix, all remaining instances of one recurring pattern found
and fixed in a single pass, rather than one-at-a-time as the two prior
sessions had done. `ActiveUsers.tsx` (Phase 1) and `FinishedOrders.tsx`
(Phase 5) had each individually fixed the same underlying defect — a
direct `product.productImages[0]` (or equivalent) read with no guard for
an empty array, producing a `${serverApi}/undefined` request the browser
blocks (`ERR_BLOCKED_BY_ORB`) — without ever sweeping the rest of the
codebase for the same pattern. This session did that sweep.

`grep -rn "productImages\[0\]" src/app/screens/` returned **8 hits across
6 files**. Three were already safe (`PausedOrders.tsx`, `ProcessOrders.tsx`
— both already had the guard `FinishedOrders.tsx` was made consistent
with in Phase 5) and needed no change. **5 were unguarded, across 4
files**:

| File | What changed |
|---|---|
| `src/app/screens/homePage/NewDishes.tsx` | Display site — `imagePath` now falls back to `/icons/noimage-list.svg` when `product.productImages[0]` is empty, instead of building `${serverApi}/undefined`. |
| `src/app/screens/homePage/PopularDishes.tsx` | Same fix, same pattern. |
| `src/app/screens/productsPage/Products.tsx` | Same fix applied to the product grid's `imagePath` (display site). **Also** a second, different site in the same file: the "Add to Basket" button builds a `CartItem` from `product.productImages[0]` directly — fixed to `product.productImages[0] || ""` so a missing image doesn't propagate an `undefined` into cart state. |
| `src/app/screens/productsPage/ChosenProduct.tsx` | Same `CartItem`-construction fix as above (`chosenProduct.productImages[0] || ""`), in the detail page's own "Add to Basket" handler. |

**Found during live verification, not caught by the grep alone (fixed
in the same pass, one file outside the `screens/` tree)**: the `|| ""`
fallback for the two `CartItem`-construction sites above is a *direct
read* fix, but it doesn't by itself stop a broken image from showing —
it only changes *which* broken request occurs. Live-testing the actual
add-to-cart flow (not just re-running the grep) showed the basket item
image request going from `${serverApi}/undefined` to `${serverApi}/`
(empty path) — still blocked (`ERR_BLOCKED_BY_ORB`), just a different
URL. Traced both places `item.image` is rendered downstream —
`src/app/components/headers/Basket.tsx` and
`src/app/screens/checkoutPage/index.tsx` (the latter *is* in the
`screens/` tree; `Basket.tsx` is not, but needed the identical fix for
the upstream fix to actually resolve anything observable) — and applied
the same fallback-to-`/icons/noimage-list.svg` pattern to both. Flagging
this explicitly: a literal "fix every direct `productImages[0]` read"
pass would have missed this, because the actual broken behavior lives
one hop downstream of two of those five call sites, in files the grep's
search pattern doesn't match at all.

**Verification**:
- `npx tsc --noEmit` — zero errors, both before and after the follow-up
  `Basket.tsx`/`checkoutPage` fix.
- `npm run build` — succeeds (exit 0), both times.
- **Live-tested against the `qa_pagination_test_*` products** (the
  existing test data with empty `productImages` arrays — exactly the
  trigger condition), real headless Chromium, real backend:
  - Homepage: all "New"/"Popular" dish cards for these products render
    `/icons/noimage-list.svg`, not a blocked request.
  - `/products` (CAMPING filter, all 3 visible products are `qa_`-tagged
    with no images): grid cards all show the same fallback correctly.
  - **First pass caught the incomplete fix live**: adding a no-image
    product to the cart and opening the basket showed
    `${serverApi}/` requesting and failing (`ERR_BLOCKED_BY_ORB`) —
    proof the `CartItem`-construction fix alone wasn't sufficient.
  - **After the `Basket.tsx`/`checkoutPage` follow-up fix, re-ran the
    identical live flow end-to-end**: homepage → products grid → add to
    cart → open basket → product detail page → "Add to Basket" — **zero
    failed requests** anywhere in the flow. Basket item image confirmed
    rendering `/icons/noimage-list.svg`. Only console output was the
    pre-existing, unrelated MUI `findDOMNode`/StrictMode deprecation
    warnings from `AuthenticationModal`.

**Files touched, full list**: `NewDishes.tsx`, `PopularDishes.tsx`,
`Products.tsx`, `ChosenProduct.tsx` (all in `src/app/screens/`), plus
`src/app/components/headers/Basket.tsx` and
`src/app/screens/checkoutPage/index.tsx` (downstream render sites, found
via live verification rather than the initial grep). Six files total.

## Session — Visual Pass Begins: Figma HikMali Header + Hero (increment 1 of 12)

**Type**: First real visual-design work in the repo. Ends the
functional-only round — the HikMali Figma file is now the design source.
Implemented via the Figma MCP `get_design_context` (design-to-code), not
from screenshots.

**Figma source**: file `4649jvQ6PRYcvZacVf0ki2` ("HikMali"), page `0:1`.
The user's original link pointed at node `2001:6`, which turned out to be
a `rounded-rectangle` named `AdobeStock_446610901` — a stock-photo
placeholder *inside* the hero, not an implementable frame. Confirmed via
`get_metadata` and raised before building anything; the user then chose
the full homepage frame `2001:2` ("home 1", 1920×8276).

**Homepage section map** (from the sparse-metadata response — the full
frame exceeds the MCP context limit, so it must be pulled section by
section):

| # | Section | Node | Size | Status |
|---|---|---|---|---|
| 1 | Header | `2012:3` | 1920×110 | **done** |
| 2 | Hero sections | `5:15` | 1920×900 | **done** |
| 3 | Shop by Category | `2479:1302` | 2030×713 | **done** |
| 4 | Best Products | `7:53` | 1622×736 | pending |
| 5 | Banner | `2479:1304` | 1620×700 | pending |
| 6 | Highlights | `7:61` | 1920×800 | pending |
| 7 | Deals Of The day | `7:90` | 1620×729 | pending |
| 8 | Testimonial | `7:122` | 1620×568 | pending |
| 9 | Product Details | `7:140` | 1481×900 | pending |
| 10 | Instagram | `2481:1308` | 1922×304 | pending |
| 11 | Free Shipping | `2018:1391` | 1570×58 | pending |
| 12 | Footer | `2012:455` | 1920×762 | pending |

**Design tokens introduced** (HikMali palette — differs completely from
the repo's existing `#d7b586` gold / `#343434`): `#707262` olive (top bar,
body text, CTA fills), `#f5f5f5` nav background, `#aeb192` sage accent,
`#ebebe8` / `#d9d9d9` hero panels. Type: Montserrat 400/500/600/700 —
**not previously loaded in the project**; added via Google Fonts in
`public/index.html`.

| Change | File(s) | What changed |
|---|---|---|
| Header + Hero rebuilt from Figma | `src/app/components/headers/HomeNavbar.tsx` | Replaced the old Burak hero markup with the design's three-part structure: 35px olive announcement bar (promo copy + currency selector), 75px `#f5f5f5` nav (brand lockup / centred links / icon row), and the 900px split-panel hero ("Hot Deals" → "Discount 30% Off" → "Adventures / Is Calling" → "Let's Go Camping" → Shop Now, plus the "Get 25% Off" block and the circular Next control). |
| Home navbar styles rewritten | `src/css/navbar.css` | Replaced lines 1–186 (the entire `.home-navbar` block, including the now-dead `.head-main-txt`/`.wel-txt`/`.service-txt`/`.logo-frame` hero selectors) with the Figma implementation. `.other-navbar` and all `.basket-frame` rules were left byte-for-byte untouched — verified by rule count after the splice. |
| Montserrat added | `public/index.html` | Google Fonts `<link>` (400;500;600;700) + preconnects. The design depends on Montserrat and the project had no font loading at all. |
| Figma assets committed | `public/icons/` (6 new) | `hm-caret-down.svg`, `hm-search.svg`, `hm-bag.svg`, `hm-user.svg`, `hero-next-ring.svg`, `hero-arrow.svg` — downloaded as real bytes rather than referenced by URL, since Figma MCP asset URLs expire after ~7 days. |

**Deliberate deviations from the Figma, and why** (all judgement calls, flagged rather than silently applied):
1. **HikMali's logo was not used.** The design exports its own wordmark (`imgGroup183303`); importing another company's brand into Venturo would be wrong and contradicts `AGENTS.md`. Substituted the Venturo badge+wordmark lockup built earlier in this session.
2. **Nav items kept as the app's real routes.** The design's nav reads `Home | Activity | Equipment | Men's | Women's | Pages` — none of which exist as routes. Implementing them literally would have produced five dead links and destroyed the working navigation, so the design's *visual* treatment (pipe separators, Montserrat, olive, underline-on-active) was applied to the real routes (`/`, `/products`, `/orders`, `/member-page`, `/help`), preserving the auth-conditional items.
3. **All existing functionality preserved**: the `Basket` dropdown, the MUI auth menu / avatar / logout, the login modal trigger, and `useGlobals` are unchanged and still wired.
4. **The search icon links to `/products`** rather than being decorative. There is no global search endpoint; product search lives on the products page. Adding a dead control would repeat the payment-card-input mistake removed in Phase 5.
5. **Hero photography is absent by design, not by omission.** Both `AdobeStock_*` layers come back from `get_design_context` as flat fills (`#ebebe8` / `#d9d9d9`), not exported images — the Figma file has them as unexported placeholders. Reproduced faithfully as flat panels; real photography still needs to be supplied.

**Verification**:
- `npx tsc --noEmit` — zero errors. `npm run build` — succeeds (exit 0).
- **Live-measured against the Figma spec** at a 1920px viewport (real headless Chromium), every value matching:
  - Announcement bar `1920×35`, `rgb(112,114,98)` = `#707262` ✓
  - Nav `1920×75`, `rgb(245,245,245)` = `#f5f5f5` ✓
  - Hero `1920×900`; panels `969.97px` / `950.03px` (spec 970 / 950) ✓
  - Title Montserrat `64px`/`700`, `rgb(112,114,98)`; accent `rgb(174,177,146)` = `#aeb192` ✓
  - All hero copy strings match the design verbatim.
- **Functionality re-confirmed live**: nav links render (`Home`, `Products`, `Help` when logged out), Basket present, login button present, search → `/products`, Shop Now → `/products`.
- **G5 asset fidelity**: all six committed assets report non-zero `naturalWidth`/`naturalHeight` in the browser (caret 9×8, badge 150×150, search 25×26, next-ring 152×152, arrow 57×15) with explicit CSS dimensions on each — no broken images, no stretched or auto-sized leaves. Zero failed requests, zero page errors.

**Known follow-ups from this increment**:
- The homepage below the hero is still the old Burak-themed content (`Statistics`, `PopularDishes`, `NewDishes`, `Advertisement`, `ActiveUsers`, `Events`). Sections 3–12 above replace these; until then the page is visually mixed, which is expected mid-migration.
- **Palette clash**: the Venturo badge is `#d7b586` gold against the new olive/sage header. Needs a decision — recolour the badge to the HikMali palette, or keep gold as the brand accent.
- The hero's circular **"Next" control is not wired to a carousel** — the design implies a slider but only one slide exists. It is the one piece of not-yet-functional UI added; either wire a carousel or drop the control.
- `OtherNavbar` still uses the old structure/palette, so `/products`, `/orders` etc. keep the previous header until their own increment.

## Session — Badge Recolour + Next-Control Removal, and Section 3: Shop by Category (increments 2–3 of 12)

**Type**: Resolves two of the three follow-ups raised by increment 1, then implements the next homepage section. The third follow-up (mixed old/new content below the hero) was confirmed by the user as expected mid-rebuild — no action.

### Increment A — badge recolour + Next-control removal

**The badge is used in four places, not one** — this drove the treatment. Measured contrast for each candidate circle fill, against both backgrounds and for the white tent glyph *inside* the circle:

| Circle fill | on `#f5f5f5` nav | on `#343434` footer | white tent inside |
|---|---|---|---|
| `#d7b586` gold (previous) | 1.75:1 | 6.7:1 | **1.84:1 — the tent was already faint** |
| `#aeb192` sage | 2.07:1 | 5.6:1 | 2.19:1 |
| `#707262` olive | **4.6:1** | 2.5:1 | **4.86:1** |

No single fill wins on both backgrounds, so **two variants** were shipped — the standard answer for a mark that sits on light *and* dark, and what makes the result read as intentional rather than a one-off tweak:

| Change | File(s) | What changed |
|---|---|---|
| Primary badge recoloured | `public/icons/venturo-badge.svg` | Circle `#d7b586` → `#707262` olive, tent stays white. Matches the olive wordmark so badge + wordmark read as a single lockup, and *improves* glyph legibility over the previous gold (4.86:1 vs 1.84:1 — the tent was the weakest element of the old mark). |
| Dark-background variant added | `public/icons/venturo-badge-light.svg` (new) | Cream `#f5f2ea` circle, `#707262` olive tent. ~11:1 against the dark footer; 4.4:1 for the tent inside. |
| Dark placements repointed | `src/app/components/footer/index.tsx`, `src/app/components/headers/OtherNavbar.tsx` | Both switched to the light variant, so recolouring the primary to olive didn't silently degrade them (olive on `#343434` would have been a muted 2.5:1). |
| Next control removed | `src/app/components/headers/HomeNavbar.tsx`, `src/css/navbar.css` | Deleted the `.hm-hero-next` block from the markup and all five `.hm-hero-next*` rules from CSS. It was the one piece of non-functional UI added in increment 1; this repo has a track record of decorative controls causing real problems (Phase 5's payment-card inputs, Phase 3's hardcoded rating). |

`HomeNavbar` and the favicon keep the primary olive badge. **Favicon caveat**: olive is the safer default — clearly visible on light/default tab chrome, somewhat muted on dark-mode chrome. No single value fixes both; flagged rather than over-solved.

`public/icons/hero-next-ring.svg` and `hero-arrow.svg` are now unreferenced. Left in place and flagged, matching how `venturo.svg`/`burak.svg` were handled — deletion stays a separate explicit instruction.

### Increment B — Section 3: Shop by Category (`2479:1302`)

| Change | File(s) | What changed |
|---|---|---|
| New section component | `src/app/screens/homePage/ShopByCategory.tsx` (new) | Title + five 390×450 category cards on a 410px pitch in a horizontal scroller. Follows the existing per-section pattern in `homePage/` (`Statistics.tsx`, `PopularDishes.tsx`, …). |
| Section styles | `src/css/home.css` | Appended `.shop-by-category` block; no existing rules touched. |
| Wired into the page | `src/app/screens/homePage/index.tsx` | Rendered first, above `<Statistics />`, matching its position under the hero in the design. |

**Four judgement calls, flagged rather than applied silently:**

1. **Card photography is absent from the design — again.** All five cards come back from `get_design_context` as flat `bg-[#d9d9d9]` fills; the `AdobeStock_*` layers are unexported placeholders, exactly as in the hero. Reproduced faithfully as flat panels; real imagery still needs supplying. This is now the third section where the Figma file has no usable photography.
2. **Category names mapped to the real backend enum.** The design's labels are marketing copy, not `ProductCollection` values: Climbing→`CLIMBING`, All Brand Tenting→`CAMPING`, Warm & Cool Jacket→`APPAREL`, Hiking Shoes→`FOOTWEAR`, Terkking→`TREKKING`. The design's **"Terkking" is a typo** — corrected to "Trekking" in the implementation.
3. **Hardcoded item counts (24/61/53/12/26) omitted.** Invented mockup numbers, and there's no way to render real ones — `GET /product/all` returns no total count. Shipping them would put fabricated data on the homepage, the same class of problem as the Next control removed in this very pass. Recorded as a reversible decision in `NEXT_STEPS.md`, alongside the price-range-filter gap that shares the same missing-aggregate root cause. **The caption spacing was re-tuned, not just left with a deleted line** — the gap closes from the design's 36px two-line block to a 32px single-line caption, verified visually and by measurement (0px dead space below the label).
4. **The scroll indicator is real, not decorative.** Five cards (2030px) overflow the 1620px container, so the row is a genuine `overflow-x: auto` scroller and the design's track/thumb is implemented as a styled native scrollbar — reusing the project's existing `::-webkit-scrollbar` pattern from `navbar.css`. The thumb actually tracks scroll position rather than being a fixed bar. The stray 29px `Arrow 3` in the design's label row has no discernible function and was omitted rather than adding another inert control.

**Cards link to `/products`** so they aren't dead. True per-category deep-linking needs `Products.tsx` to read a `productCollection` query param (it currently only holds local state) — flagged as a follow-up, not done here since that file belongs to a later increment.

**Verification** (real headless Chromium at a 1920px viewport, so measurements compare directly to the design):
- `npx tsc --noEmit` — zero errors. `npm run build` — succeeds (exit 0).
- **Increment A**: all five `.hm-hero-next*` selectors return **0 nodes** in the live DOM. Nav badge resolves to `venturo-badge.svg` (150×150 loaded); footer badge resolves to `venturo-badge-light.svg` (150×150 loaded). Cropped screenshots confirm the olive badge now reads as one deliberate lockup with the wordmark, and the hero is clean where the Next control was.
- **Increment B**, every value matching spec: title Montserrat `32px`/`600`, `rgb(112,114,98)` = `#707262` ✓ · 5 cards ✓ · card media exactly `390×450` at `x=150` ✓ · pitch exactly `410px` ✓ · labels `["Climbing","All Brand Tenting","Warm & Cool Jacket","Hiking Shoes","Trekking"]` ✓ · all five hrefs resolve ✓.
- **Scroll proven functional, not assumed**: `scrollWidth 2030 > clientWidth 1620`, `overflow-x: auto`, and setting `scrollLeft = 300` returns `300`.
- **No fabricated data**: a regex sweep of the section's rendered text for `\d+\s*Items` returns no match.
- Zero failed requests, zero page errors.

**Open items after this increment**: sections 4–12 remain; `OtherNavbar` still uses the old structure/palette; hero and category photography still needed; per-category deep-linking still needs the `Products.tsx` query-param addition.

## Session — Responsive Conventions (applies to all remaining sections)

**Type**: Foundation work, done before Section 4 because every remaining section would otherwise re-derive responsive behaviour inconsistently. Sections 1–3 had been built to the 1920px frame with fixed pixels.

### What was actually broken (measured, not assumed)

| Viewport | Gutter | Hero copy `x` | H1 | Overflow |
|---|---|---|---|---|
| 1920 | 150px ✓ | 208 ✓ | 64px | none |
| 1536 | **0px** ✗ | **58** ✗ | 64px | none |
| 1440 | **0px** ✗ | **58** ✗ | 64px | none |

Nothing overflowed or collided — the layout *degraded* rather than broke. Root cause was a single declaration: `.hm-inner { max-width: 1620px; width: 100%; padding: 0 }`. The 150px gutter existed only as a side effect of the viewport exceeding 1620px, so below that it collapsed to zero and content sat flush against the raw screen edge.

**The review machine is 1440px** — measured from live desktop bounds (`0, 0, 1440, 900`) on a 2560×1600 Retina M2, with overlay scrollbars consuming no layout width. That is the *worst* case in the table, which is why this was visible on screen.

### The deciding finding: mobile is restructured, not scaled

Pulled `mob 01` (node `2397:592`): top bar `7:142`, nav `7:141`, hero `7:144`.

| | Desktop `home 1` | Mobile `mob 01` |
|---|---|---|
| Hero | side-by-side 970/950 | **stacked** — image on top, copy below |
| Copy | left-aligned x=208 | **centered** |
| "Get 25% Off" | right panel | **overlaid on the image** |
| H1 | 64px / lh 82 | **48px / lh 58** |
| "25%" | 64px | 64px — **unchanged** |
| Body / button | 14px | 14px — **unchanged** |
| Nav links | Home │ Products │ Help | **dropped** |
| Currency selector | shown | **dropped** |
| Nav icons | 24px | **17px** |
| Gutter | 150px | **20px** |

This ruled out pure fluid scaling: `clamp()` interpolates numbers, not layout, so it cannot restack, re-center, or hide elements.

### Approach adopted — hybrid, with a clear division of labour

Shared tokens live in `src/css/index.css` (globally imported via `src/index.tsx`), so sections 4–12 inherit rather than re-derive. Each clamp is a linear interpolation pinned to **both** authored anchors exactly:

```css
--vt-gutter:      clamp(20px, 8.497vw - 13.14px, 150px);   /* 150 @1920 -> 20 @390 */
--vt-h1-size:     clamp(48px, 1.0458vw + 43.92px, 64px);   /* 64 @1920 -> 48 @390 */
--vt-h1-leading:  clamp(58px, 1.5686vw + 51.88px, 82px);
--vt-hero-height: clamp(748px, 9.935vw + 709.25px, 900px);
--vt-section-y:   clamp(48px, 3.4vw + 34.75px, 100px);
--vt-content-max: 1920px;
```

- **Fluid tokens** for any purely numeric value with two known anchors.
- **A single 900px breakpoint** reserved strictly for structural change (hero restack, copy centering, hiding nav links + currency selector, icon resize). CSS custom properties can't be used in `@media` conditions, so 900px is written literally and `--vt-bp-structural` documents it.
- **Plain px** for values the design deliberately holds constant at both ends (`"25%"` 64px, body/button 14px) — these get neither treatment.

Containers changed from a 1620px cap to full design width plus fluid gutter padding, so the gutter is now a real property rather than a side effect. Absolute offsets were rebased onto the token (`left: calc(var(--vt-gutter) + 58px)`) so hero copy tracks the gutter instead of pinning to 58px.

| Change | File(s) |
|---|---|
| Shared tokens | `src/css/index.css` |
| Containers, hero, breakpoint | `src/css/navbar.css` |
| Section 3 adopts same convention | `src/css/home.css` |

### Verification (4 widths, `tsc` + `build` clean)

| width | overflow | nav gutter | §3 gutter | copy x | H1 | hero h | links | icon |
|---|---|---|---|---|---|---|---|---|
| 1920 | none ✓ | 150px | 150px | 208 | 64.0px | 900px | shown | 24px |
| 1536 | none ✓ | 117px | 117px | 175 | 60.0px | 862px | shown | 24px |
| **1440** | none ✓ | 109px | 109px | 167 | 59.0px | 852px | shown | 24px |
| 390 | see below | 20px | 20px | 20 | 48.0px | stacked | hidden | 17px |

- **Zero-gutter widths: none.** Both anchors land exactly — H1 `64px @1920`, `48px @390`; gutter `150px @1920`, `20px @390`.
- Design-constants held at every width: `"25%"` 64px, eyebrow/button 14px.
- Structural switch confirmed at 390: links hidden, icons 17px, copy centered, left panel hidden, offer overlaid.
- **A bug was found and fixed during verification**: at 390 the announcement bar's two `nowrap` strings sat side by side and overflowed. Checked the mobile frame rather than guessing — it keeps only the promo string, centred, dropping the currency selector. Added to the breakpoint.

### Follow-up in the same session — hero height vs. real viewport HEIGHT

The width work above left a second, larger bug: hero height moved only 900px→852px across 1920→1440, i.e. it was still essentially Figma's literal 900px and unresponsive to viewport *height*. The width verification had used 1000–1100px test heights, which masked it entirely.

**Real window measured live** (real Google Chrome 152, maximized, fresh profile):

| | |
|---|---|
| screen (logical) | 1440 × 900 |
| `screen.avail` | 1440 × **806** (macOS menu bar + Dock take 94px) |
| **`window.innerHeight`** | **719px** |
| Chrome UI (tabs + toolbar) | 87px (a bookmarks bar would take ~40 more) |

Against that real 719px, the hero was **118.5% of the visible window**; header+hero **133.8%**, leaving **−243px** — nothing below the hero was reachable without scrolling.

**Checked whether the design gives any guidance — it does not.** Desktop hero 900px on a 1920×8276 frame; mobile hero 748px on a 390×14589 frame. hero÷width is 46.9% vs 191.8%; hero÷frame-height is 10.9% vs 5.1%. Neither ratio is consistent: height is near-constant in absolute px (900 vs 748, 1.20×) while width changes 4.92×. Figma frames are scrolling canvases with no viewport-height concept, so the design *cannot* express "fit the window". The `vh` cap is therefore a deliberate, agreed **deviation** — an improvement the design is silent on, not a fidelity fix.

**A constraint that shaped the fix**: the copy block measures 460px pinned at `top: 238px`, bottom at 683px, while a 719px window leaves only 609px below the header. A height cap alone would have *clipped the copy*. So the fix is two-part.

| Change | File | What |
|---|---|---|
| Reusable convention | `src/css/index.css` | `--vt-vh-cap: 78vh` plus `--vt-hero-height: clamp(520px, min(9.935vw + 709.25px, var(--vt-vh-cap)), 900px)`, documented as the pattern for any Figma-height-locked element |
| Vertical centring | `src/css/navbar.css` | `.hm-hero-copy` and `.hm-hero-offer` moved from fixed `top` offsets to `top: 50% / translateY(-50%)`, with `transform: none` resets inside the 900px breakpoint so mobile positioning is unaffected |

Centring turned out to be an *equivalent expression* of the design rather than a compromise: measured at full height, hero centre 450px vs copy centre 451px vs offer centre 450px — the design already centres both, within 1px.

**Verified against the real 719px measurement, not an arbitrary value:**

| case | hero | hdr+hero | % window | next section peeking | copy clipped |
|---|---|---|---|---|---|
| 1920×1250 (tall monitor) | **900px** ✓ ceiling | 1010px | 81% | 240px | no |
| 1920×890 | 694px | 804px | 90% | 86px | no |
| 1536×815 | 636px | 746px | 91% | 69px | no |
| **1440×719 (real Chrome)** | **561px** | 671px | **93%** | **48px** | no |
| 1440×679 (+bookmarks bar) | 530px | 640px | 94% | 39px | no |

Every predicted figure landed exactly (561 / 671 / 78.0% / 48px). Hero went from 118.5% → **78.0%** of the visible window. The 900px Figma ceiling is still reached on windows ≥1154px tall. No copy clipped at any size; no horizontal overflow at desktop widths; `tsc` + `build` clean.

## Session — Section 4 of 12: Best Products (`7:53`)

**Type**: First section built on real backend data end-to-end. Pulled fresh via `get_design_context` on `7:53` rather than from earlier metadata.

### Four flagged decisions — all checked against the schema, none guessed

| # | Design shows | Backend reality | Decision |
|---|---|---|---|
| 1 | Red **"20% Off"** badge on 2 of 4 cards | `Product` has **no** discount / sale-price / compare-at field (confirmed in `Product.model.ts` *and* in a live `GET /product/all` response) | **Omitted.** Same class as Section 3's fabricated item counts — a percentage would have to be invented. |
| 2 | **"Model : Caracal Ashley Big Cat"**, four colour swatches, **"Delivery At 7 days"** | No `model`, no colour/variant, no delivery/lead-time field anywhere on `Product` | **Whole popover omitted.** All three rows would be placeholder text presented as real. |
| 3 | `Mountaineering │ Camping │ Hiking │ Trekking │ Cycling │ Gym` | `ProductCollection` = CLIMBING/CAMPING/HIKING/TREKKING/CYCLING/APPAREL/FOOTWEAR/OTHER — **Mountaineering and Gym do not exist** | Row rebuilt from real enum values: **Climbing · Camping · Hiking · Trekking · Cycling · Apparel**. Mountaineering→CLIMBING is a genuine domain synonym; Gym→APPAREL is a substitution to keep the design's six-item rhythm. Flagged as a substitution, not a mapping. |
| 4 | "Add To Cart" bar | — | **Genuinely wired** to `useBasket`'s `onAdd` with the product's real `_id`/name/price. `onAdd` had to be threaded `App.tsx → HomePage → BestProducts`; `HomePage` previously took no props. |

### What the hover state actually is

Checked rather than assumed: the design's third card carries a drop shadow the others lack, an extra Model/colours/delivery panel, **and** a button reading `Add To Cart | $ 25.00`. So it is a real hover-reveal, not four static cards. After removing the fabricated panel (flag 2), the reveal reduces to two things that *are* real — the shadow and the price — and both were implemented, following the `hover-interactions` skill: `@media (hover: hover)` scoping so touch devices aren't affected, 200ms ease-out in / 250ms ease-in-out out, the design's own `4px 4px 4px rgba(0,0,0,0.1)` shadow, and an animated `max-width` on the price so the label re-centres smoothly instead of snapping. Mirrored on `:focus-within` for keyboard parity.

### Real data used

`productName`, `productDesc`, `productPrice`, `productImages` (with the established empty-array fallback — all five dev products have `productImages: []`), and `averageRating`/`reviewCount` from Phase 3. **Rating renders only when `reviewCount > 0`**, so an unreviewed product never reads as "0 stars".

**Category row is a real filter**, refetching with `productCollection` — not decorative. Confirmed live: clicking *Camping* fires `/product/all/?order=productViews&page=1&limit=4&productCollection=CAMPING` and returns the 3 CAMPING products.

**Deviation flagged**: the design underlines the first filter by default, but CLIMBING has no products in the dev DB, so defaulting to it would render an empty section. Default is therefore *no filter* (top 4 across all categories); the underline appears once a category is selected.

| File | Change |
|---|---|
| `src/app/screens/homePage/BestProducts.tsx` | New section component |
| `src/app/screens/homePage/index.tsx` | Renders it; accepts + forwards `onAdd` |
| `src/app/App.tsx` | Passes `onAdd` to `HomePage` |
| `src/css/home.css` | Section styles on the shared `--vt-*` tokens |

### Verification (`tsc` + `build` clean)

- **Real data renders**: `qa_pagination_test_4/2/1/3` with real descriptions; the single real rating `★ 4.0 (1)` appears on `test_4` only.
- **No demo or fabricated content anywhere** — automated check for `RuckSack`, `4 key Fold And Cover Rack`, `Caracal Ashley Big Cat`, `Delivery At 7 days`, `20% Off`, `Mountaineering`, `Gym`: **all absent**.
- **Add To Cart genuinely works**: badge `""` → `"1"`, `localStorage.cartData` gains `{_id:"6a8da4be7b0b9b9c0ec89f18", name:"qa_pagination_test_4", price:55, quantity:1}` — a real 24-hex Mongo id matching a rendered card.
- **Hover reveal**: price `max-width` 0px → 120px, text `| $55`.
- **Width matrix** — no overflow at any width; gutter tracks the token; grid collapses 4→1 column at the 900px structural breakpoint:

| width | overflow | gutter | cols | card | title |
|---|---|---|---|---|---|
| 1920 | none ✓ | 150px | 4 | 390px | 64.0px |
| 1536 | none ✓ | 117px | 4 | 310px | 60.0px |
| 1440 | none ✓ | 109px | 4 | 290px | 59.0px |
| 390 | none ✓ | 20px | 1 | 350px | 48.0px |

Zero page errors.

**Follow-up, same session — flag #3's label reconsidered.** The initial ship used `Gym → APPAREL`. Revisited before commit: `FOOTWEAR` is a closer real synonym for "Gym" than "Apparel", and — since Apparel/Footwear are otherwise both absent from this six-item row — Footwear also means the row surfaces a category it would have otherwise omitted entirely, rather than showing Apparel twice-over in spirit (Section 3's own row already leans on outerwear-adjacent categories). Row now reads **Climbing · Camping · Hiking · Trekking · Cycling · Footwear**. `Mountaineering → CLIMBING` unchanged. Still a flagged substitution, not a mapping — `Gym` remains a value with no real equivalent.

**Remaining 390px page overflow is pre-existing and not from this work.** An offender scan attributes it precisely: **zero** offending elements inside `home-navbar` / `shop-by-category`; the entire 876px comes from one Burak-era element — a 1250px-wide `.no-data` box in `PopularDishes` whose right edge is 1266px (1266 − 390 = 876 exactly). Statistics, Events and the other un-rebuilt sections contribute smaller offenders. This resolves as sections 4–12 replace them; no old-section mobile work was done here since those components are scheduled for replacement.

## Session — Section 5 of 12: Banner (`2479:1304`)

**Type**: The first section where the design's whole premise, not just a field on a card, had no backend counterpart — flagged and agreed with the user *before* building, rather than substituted silently the way Section 4's per-field flags were.

### The flag

The design is a two-panel **"Shop All Women's" / "Shop All Men's"** promo. `Product` has no gender/audience field at all (confirmed against the same schema pulled for Section 4) — there is no `/products?gender=women` to link to, and no way to query "women's products" from the backend. Unlike a missing field on an otherwise-real card, the entire split axis this section is built around doesn't correspond to anything in the domain model, so it was raised rather than guessed.

**Agreed direction**: the two panels split on two real, already-used backend sort orders instead of gender — `order=createdAt` ("New Arrivals", the same query `NewDishes`/`PopularDishes` already use) and `order=productViews` ("Best Sellers", the same query `BestProducts` uses for its default listing). Both are genuinely different, genuinely real result sets, preserving the design's two-panel contrast without inventing anything.

### What was checked before implementing (not assumed)

- **Mobile counterpart pulled** (`7:147`, `get_design_context`): confirmed the two panels **stack** on mobile (needs the 900px structural breakpoint, not a fluid transform) and that the panel images are `#d9d9d9` flat fills there too — unexported placeholders, consistent with every prior section.
- **Aspect ratio check, not assumed**: desktop panel is `800×700`; mobile is `390.869×342.01`. `800/700 = 1.142857`; `390.869/342.01 = 1.14286` — the **same** `8:7` ratio at both authored widths. Used `aspect-ratio: 8/7` instead of a fabricated height clamp — one rule covers every width between the two anchors instead of inventing an in-between value.
- **Text-inset anchors read from both frames, not guessed**: desktop text sits `100px` from each panel's own edge; mobile sits `~168px` in (proportionally further on the narrower panel). Implemented as its own local `clamp(100px, 185.33px - 4.444vw, 168px)` — same two-anchor-interpolation *methodology* as `--vt-gutter`/`--vt-h1-size`, applied locally since this inset isn't reused elsewhere in the shared token set.
- **CTA position**: converted from the design's fixed `top: 3315px` offset to `margin-top: auto` inside a flex column (button pinned to the bottom, content reflows) — same "equivalent expression, not a compromise" approach used for the hero copy's centring in the responsive-conventions session.

### Deferred, not silently worked around

Both panels currently link to plain `/products` rather than a sort-differentiated URL — `Products.tsx` still doesn't read a query param at all (the same gap Sections 3 and 4 already hit for `productCollection`). This session's finding **confirms** that gap also needs `order`, not just `productCollection` — upgraded from "probably" to confirmed in `NEXT_STEPS.md`, which now names this as a three-section blocker.

| File | Change |
|---|---|
| `src/app/screens/homePage/Banner.tsx` | New section component |
| `src/app/screens/homePage/index.tsx` | Renders it between `BestProducts` and `Statistics`, matching the Figma y-order (`y=2759`, immediately after Best Products' `y=1923`) |
| `src/css/home.css` | Section styles; `--vt-gutter`/`--vt-section-y` reused, one local two-anchor clamp for the text inset, `aspect-ratio` for panel sizing, 900px breakpoint for the stack |

### Verification (`tsc` + `build` clean)

- **Real content, no gender copy shipped**: headings render `"New Arrivals"` / `"Best Sellers"`; automated check for `"Women"`, `"Men's"`/`"Men’s"`, `"Gender"` — **all absent**.
- **Links**: both panels `href="/products"` (confirmed, not the differentiated URL — matches the flagged deferral above).
- **Aspect ratio holds at every width**: `1.143` (= 8/7) measured at 1920/1536/1440/390 alike, confirming the single `aspect-ratio` rule replaces the fabricated-height-clamp approach cleanly.
- **Hover** (checked against the design, which does show a genuine state — the design has no explicit hover marker here, so this reuses the established `hover-interactions` pattern from Section 4: `@media (hover: hover)`, subtle `scale(1.03)` on the image, CTA colour-inverts): `transform: none → matrix(1.03,0,0,1.03,0,0)`; CTA `rgb(255,255,255) → rgb(112,114,98)`.
- **Width matrix** — no overflow at any width; gutter (measured off the panel's real position, not the padding box, after an initial script measurement artifact was caught and corrected) tracks the shared token exactly as every other section; row switches to a stacked column at the 900px breakpoint:

| width | overflow | gutter | layout |
|---|---|---|---|
| 1920 | none ✓ | 150px | row |
| 1536 | none ✓ | 117px | row |
| 1440 | none ✓ | 109px | row |
| 390 | none ✓ | 20px | stacked |

Zero page errors.

## Session — Fixed the `Products.tsx` Deep-Linking Gap (blocked Sections 3, 4, 5)

**Type**: Bug fix, closing a gap tracked across three prior sessions rather than deferred a fourth time.

### What was read before changing anything

`Products.tsx`'s existing pattern: a single `useState<ProductInquiry>` object (hardcoded defaults: `order: "createdAt"`, `productCollection: CLIMBING`) drives one `useEffect` that calls `ProductService.getProducts` whenever the state object changes. Every in-page control (`searchCollectionHandler`, `searchOrderHandler`, `searchProductHandler`, pagination) works by calling `setProductSearch(prev => ({...prev, ...}))`. `useHistory` was already imported but only used for `history.push` — nothing anywhere read the current URL.

**One correction made before touching call sites**: the task described "Best Products' category filter row" as one of the three blocked *links*. Checked against the actual Section 4 build rather than assumed — that row is **not** links to `/products` at all; it's local `onClick` state (`setActiveCollection`) that refetches and re-renders the section's own inline preview, already fully functional (confirmed live back in the Section 4 session). The only real `/products` link in that file is "Shop All Categories". Converting the working local-filter buttons into navigation would have been a regression, not a fix — flagged and resolved instead by wiring "Shop All Categories" to carry through whichever category is currently active in that row.

### The fix

`Products.tsx`'s `useState` initializer became a lazy function, `parseInitialProductSearch(location.search)` — runs once on mount via React's lazy-initializer semantics, not a new effect. Reads `productCollection` (validated against the real enum; falls back to the pre-existing `CLIMBING` default if absent/invalid) and `order` (no client-side whitelist, matching prior behavior — the backend already whitelists-with-fallback per `API_REFERENCE.md`). In-page controls are untouched: they still call `setProductSearch` exactly as before, and the URL is not re-read after mount — matches the "changes what the page starts with, not the interactive behavior" scope exactly.

| File | Change |
|---|---|
| `src/app/screens/productsPage/Products.tsx` | `useLocation` + `parseInitialProductSearch`, lazy `useState` initializer |
| `src/app/screens/homePage/ShopByCategory.tsx` | All 5 tiles: `/products` → `/products?productCollection=<value>` |
| `src/app/screens/homePage/BestProducts.tsx` | "Shop All Categories": now carries `?productCollection=<activeCollection>` when a filter is selected in that section |
| `src/app/screens/homePage/Banner.tsx` | Both panels: `/products` → `/products?order=createdAt` / `?order=productViews` |

### Verification (`tsc` + `build` clean)

Checked the real `GET /product/all` request fired for each link, not just the URL bar:

| Link | URL bar | Real request fired |
|---|---|---|
| ShopByCategory "Camping" tile | `/products?productCollection=CAMPING` | `...&productCollection=CAMPING` ✓ |
| BestProducts "Shop All Categories" (no filter active) | `/products` | `...&productCollection=CLIMBING` (unchanged default) ✓ |
| BestProducts "Shop All Categories" (Hiking active) | `/products?productCollection=HIKING` | `...&productCollection=HIKING` ✓ |
| Banner "New Arrivals" | `/products?order=createdAt` | `...order=createdAt...` ✓ |
| Banner "Best Sellers" | `/products?order=productViews` | `...order=productViews...` ✓ |

**In-page controls confirmed still fully functional after arriving pre-filtered**: landed via the Camping link, `CAMPING` button showed active; clicking `HIKING` in-page fired a real request switching to `productCollection=HIKING`; clicking `PRICE` afterward fired `order=productPrice&...&productCollection=HIKING` — sort and filter state both correctly composed together, exactly as before this fix.

`NEXT_STEPS.md`'s entry marked resolved (kept, not deleted, per the existing convention for resolved items).

## Session — Section 6 of 12: Highlights

Full-bleed background panel with a "Highlights" heading, six decorative "+"
markers, a vertical tick decoration, and a single overlaid product card
(Figma node `7:61`, 1920×800).

### What was checked before building

- **Mobile counterpart**: the mobile page (`mob 01`) has no frame literally
  named "Highlights" — node `7:148` ("Product") was identified as the real
  counterpart by its background rectangle sharing the exact same unexported
  asset name, `AdobeStock_505354052`, as the desktop node. Pulled its full
  `get_design_context` directly (not inferred from the metadata tree) and
  confirmed it has **no heading, no tick decoration, no cross markers, and
  no "20% Off" badge at all** — a genuine, source-confirmed content
  simplification unique to this section (every other section keeps its
  heading on mobile), not an omission artifact.
- **Background aspect ratio**: desktop 1920×800 and the mobile background
  element's 757.107×315.461 are both exactly 2.4:1 — one `aspect-ratio`
  rule covers every width, no fabricated height clamp.
- **Card content**: "20% Off" badge has no backend discount field — omitted,
  same resolution as every prior card. The card has no price element
  anywhere in the source (desktop or mobile) and no product-photo `<img>`
  either — shipped exactly as designed rather than adding either (see
  `docs/ai/NEXT_STEPS.md` for the price-display flag raised to the user).
- **Decorative markers**: the six "+" icons and the tick line have no href,
  hover state, or interactive role in the source — rendered as plain
  decorative elements, hidden below 900px to match the confirmed mobile
  absence rather than scaled down.
- **Product data**: real product fetched via the existing
  `ProductService.getProducts` pattern (`{ page: 1, limit: 1, order:
  "productViews" }`, no collection filter) — surfaces the current
  most-viewed real product. Live-verified against the real backend:
  `qa_pagination_test_4` (`averageRating: 4, reviewCount: 1`).

### Files

| File | Change |
|---|---|
| `src/app/screens/homePage/Highlights.tsx` | New section component |
| `src/app/screens/homePage/index.tsx` | Renders it between `Banner` and `Statistics`, matching Figma y-order |
| `src/css/home.css` | Section styles; `--vt-gutter`/`--vt-content-max`/`--vt-section-y` reused, `aspect-ratio: 2.4` for the background, fixed 390×554 card size (no second desktop anchor exists to interpolate against — mobile restructures rather than scales it), 900px breakpoint switches overlay→stacked and hides the heading/tick/crosses |

### Verification (`tsc` + `build` clean)

Live headless Chromium, real backend, full width matrix plus the real
measured 1440×719 window:

| width | section ratio | card left offset | heading/crosses visible | "20% Off" present |
|---|---|---|---|---|
| 1920 | 2.400 | 150px | yes | no |
| 1536 | 2.400 | 117.4px | yes | no |
| 1440 | 2.400 | 109.2px | yes | no |
| 390 (stacked) | n/a (auto height) | 20px | no (matches confirmed mobile absence) | no |
| 1440×719 (real window) | — | — | renders correctly, no clipping (not a hero, no vh cap needed) | no |

Card left offset tracks `--vt-gutter` exactly at every desktop width,
matching the token's already-proven values. Real product name/description
render (`qa_pagination_test_4`); no fabricated discount, price, or image
shipped. Zero page errors.

## Session — Section 7 of 12: Deals Of The day

Countdown-timer block plus a 4-product grid (Figma node `7:90`, 1620×729,
mobile counterpart `7:149`). This was a plan-first section — the
countdown was flagged and confirmed with the user before any component
code was written, same as Banner's gender-panel question.

### What was checked before building

- **Countdown data**: grepped `Product.model.ts` (full schema dump) and
  the entire backend `src/` for any expiry/deal-window/sale-end/countdown
  concept. Nothing exists — the only hit was `Auth.service.ts`'s
  `expiresIn`, unrelated JWT config. Raised to the user with two real
  options (omit entirely vs. a static non-counting label) rather than
  building a countdown ticking down to an invented end-time. **Decision:
  omit the countdown entirely**, plain "Deals Of The Day" heading over
  the product grid.
- **Body copy**: confirmed via the design context directly (not memory)
  that the paragraph next to the countdown is literal, unedited Lorem
  Ipsum. Also absent from the mobile frame entirely — dropped, not
  replaced with invented descriptive copy.
- **Grid sort**: no explicit sort/filter hint in the design. Best
  Products already uses `productViews`; Banner already covers
  `createdAt`/`productViews` via its two links. Defaulted this grid to
  `order=averageRating` — a real, whitelisted sort (`ProductSortBy` in
  `product.enum.ts`) not used by any prior section, keeping this a
  distinct real slice rather than a duplicate. `productLeftCount` (a
  plausible "almost sold out" reading of "deals") was considered and
  ruled out — it isn't in the backend's sortable-field whitelist, so an
  unrecognized `order` value there silently falls back to `createdAt`.
- **"20% Off" badge and price-on-button**: re-checked specifically after
  an initial pass conflated this with Highlights' clean desktop-only
  heading (a genuine, section-wide breakpoint split). It isn't the same
  shape: mobile only has 2 visible cards, and price/badge/Model-Delivery
  all appear on card 1 only, not on its sibling card 2 — the same
  single-decorated-card artifact that also puts the badge on 2 of the 4
  desktop cards. It's inconsistent *within* each breakpoint, not a clean
  mobile-shows-it/desktop-doesn't rule, so there's no "match the real
  per-breakpoint source" case to make here the way there was for
  Highlights. No discount field exists on `Product` either way (badge
  stays omitted regardless). `productPrice` *is* real backend data, so
  showing it uniformly was considered as a genuine alternative — but the
  decision was to keep it omitted on all 4 cards at every width, matching
  the majority/primary (desktop) treatment rather than picking the one
  inconsistently-decorated card as the rule.
- **Mobile frame** (`7:149`, confirmed via full `get_design_context`):
  cards stack full-width in a single column, same treatment as every
  prior mobile product card; the Lorem Ipsum paragraph has no mobile
  counterpart at all.
- **Card content**: no product-photo `<img>` in either the desktop or
  mobile markup — not fabricated, same as Highlights' card.

### Files

| File | Change |
|---|---|
| `src/app/screens/homePage/DealsOfTheDay.tsx` | New section component |
| `src/app/screens/homePage/index.tsx` | Renders it between `Highlights` and `Statistics`, matching Figma y-order |
| `src/css/home.css` | Section styles; `--vt-gutter`/`--vt-content-max`/`--vt-section-y` reused, 4-column grid at desktop widths, 900px breakpoint collapses to a single column, matching the confirmed mobile frame |

### Verification (`tsc` + `build` clean)

Live headless Chromium, real backend, full width matrix plus the real
measured 1440×719 window — confirmed at every width: no countdown/timer
markup, no "Lorem Ipsum" text, no "20% Off" text, 4 real product
names/descriptions render (`qa_pagination_test_4/2/1/3`, the real
`averageRating`-sorted order from the live backend), grid is 4-column
≥900px and single-column <900px, card left offset tracks `--vt-gutter`
exactly (150/117.4/109.2/20px). Zero page errors.

## Session — Section 8 of 12: Testimonial — deferred, not built

Checked node `7:122` (desktop) and `7:150` (mobile, confirmed via
`get_metadata`, repeats the exact same template 4 times) before writing
any code, same discipline as every prior section.

### What was checked

- **`Review.model.ts`**: `memberId`, `productId`, `rating` (1–5),
  `comment`, `createdAt`/`updatedAt` only. No like-count field, no
  social-handle field, no video-review concept.
- **`Member.model.ts`**: `memberNick`, `memberImage` exist (real
  avatar/name backing would be possible), but nothing else relevant here.
- **`review.controller.ts`**: only `getProductReviews(productId)` is
  exposed — there is no site-wide "all reviews" endpoint, so a global
  testimonial feed can't be fetched in one real request today.
- **Live dev data**: exactly **one** real review exists across the whole
  database (on `qa_pagination_test_4`, `rating: 4`).

### What the design actually contains — fully fabricated, not partially

Every specific piece of content is a fabricated Figma-mockup value with
no schema equivalent: "150,000+" customers (no such metric exists
anywhere), "Over All Reviews (45)" (no aggregate endpoint), a 5-star
aggregate rating icon row (no aggregate-rating field), all 4 cards
hardcoded to the literal same placeholder identity ("Alexis Ohanian
@alexisohanrian" — a stock Figma name, not this project's content) with
identical generic filler copy, a fabricated "75" like-count, a fabricated
"June 2020" date, a Twitter icon (no social-handle field on `Member`),
and one card is a YouTube video-embed placeholder (no video-review
concept in the schema at all).

### Decision

Raised to the user with two real options rather than guessing: (1) omit
the section entirely for now, flagged for a future revisit once real
review volume/fields exist, or (2) build it with only real data (real
member nick/avatar, real rating, real comment, real date), however
sparse — currently ~1 card. **Decision: option 1 — Section 8 is omitted
entirely this session.** No component was created, `index.tsx` was not
touched for this section, no docs beyond this entry and the
`NEXT_STEPS.md` flag were changed. `tsc`/`build` unaffected (no new
code).

## Session — Section 9 of 12: Product Details

A full product-detail teaser (Figma node `7:140`, mobile counterpart
`7:151`) — image gallery, name, price, size, Add To Cart / Buy To Now,
description. Bundled several fabrication issues, most resolved by direct
precedent; one (a fake brand watermark) was a genuine decision raised to
the user before building.

### What was checked before building

- **Discount/original price**: "Save 20% Off" and a struck-through
  "$350.000" — no discount field on `Product`, only a single
  `productPrice`. Omitted, same resolution as every prior card.
- **Size picker**: the design shows a selectable "S / M / L / XL" row.
  Checked `ProductSize` directly — it's a single fixed value per product
  (`SMALL/NORMAL/LARGE/SET`), not a set of purchasable variants. Same
  class of problem as the Model/colour swatches dropped in Sections 4 and
  6: rendered as an inert label of the product's real size, not a fake
  selector implying options that don't exist.
- **Apparel bullet list** ("All-over print," "corozo buttons," "curved
  hemline," etc.): irrelevant to outdoor gear, no schema field — omitted.
- **Body copy**: "This is a demonstration store..." and (mobile-only)
  "Together we will find the perfect that's our product." are generic
  filler, not product-specific. Replaced with the real product's
  `productDesc`.
- **"Size Chart" / "Ask questions" accordion rows**: no size-chart data
  or Q&A feature exists anywhere in this app. Dropped entirely rather
  than shipped as dead UI — same precedent as the hero's removed "next"
  slide control (Section 1).
- **Decorative brand watermark**: the circular seal overlaid on the
  product image reads "ADVENTURE MOUNTAIN OUTDOOR ESTD 2021" — a
  literal, different, fake brand identity, not just missing data.
  Flagged to the user with two real options before building (omit vs.
  replace with the real Venturo mark). **Decision: replaced with the
  real `venturo-badge.svg`** (already used in the header), same asset,
  same watermark position.
- **Thumbnails/main image**: mapped onto the real `productImages` array
  with the existing empty-image fallback (`/icons/noimage-list.svg`).
  Thumbnail row only renders when a product actually has images — no
  fake empty slots implying photos that don't exist.
- **Mobile frame** (`7:151`, confirmed via full `get_design_context`):
  product-title heading is genuinely absent from the mobile instance —
  not a partial/per-card inconsistency like Deals' price (Section 7),
  but a clean, total absence in the section's only mobile occurrence,
  same shape as Highlights' desktop-only heading. Desktop-only here too.
  Gallery axis swaps: thumbnail rail (left, desktop) becomes a thumbnail
  row (top, mobile) above the stacked content — same overlay/split-to-
  stack transformation already used for the hero and Highlights.
- **Featured product**: `order=productPrice, sortDirection=DESC` (highest
  priced) — a new, distinct real slice from every prior section's sort.
  `sortDirection` didn't exist on the frontend's `ProductInquiry`
  type/service yet (the backend already supported it); added as a small,
  mechanical pass-through, not a new feature.
- **"Buy To Now"**: kept as literally designed (present, identically
  worded, on both desktop and mobile — not a one-off typo to silently
  "fix"). Wired to the existing real `/checkout` route (same
  `history.push("/checkout")` pattern already used in `Basket.tsx`) after
  adding the item to cart — a real capability, not fabricated.

### Files

| File | Change |
|---|---|
| `src/app/screens/homePage/ProductDetails.tsx` | New section component |
| `src/app/screens/homePage/index.tsx` | Renders it between `DealsOfTheDay` and `Statistics` (Section 8 "Testimonial" was skipped) |
| `src/lib/types/product.ts` | `ProductInquiry` gains optional `sortDirection?: "ASC" \| "DESC"` |
| `src/app/services/ProductService.ts` | `getProducts` passes `sortDirection` through as a query param when present |
| `src/css/home.css` | Section styles; desktop row layout (gallery + content), 900px breakpoint switches to a stacked column, swaps the thumbnail axis, and hides the title, matching the confirmed mobile frame |

### Verification (`tsc` + `build` clean)

Live headless Chromium, real backend, full width matrix plus the real
measured 1440×719 window. Confirmed at every width: no "ADVENTURE
MOUNTAIN"/"ESTD 2021" text, no "Save"/"20%" text, no apparel bullet copy,
no "demonstration store" copy, no Size Chart/Ask questions rows. Real
product renders (`qa_pagination_test_5`, `$65`, size `LARGE`, real
`productDesc`), real Venturo badge visible. Layout is a row ≥900px and a
column <900px; title visible ≥900px, hidden <900px, matching the
confirmed mobile frame exactly. Zero page errors.

## Session — Section 10 of 12: Instagram

A row of 6 image tiles (Figma node `2481:1308`, mobile counterpart
`7:152`). Checked whether this implies a real social-feed integration or
a product-link gallery before building — resolved cleanly, no
stop-and-ask needed this time (unlike Banner/Deals/Product Details).

### What was checked

- **Social API integration**: grepped both repos for
  `instagram`/`social`/`oauth`/API-key patterns. Nothing exists beyond a
  static Material icon (`userPage/index.tsx`) and a static
  `/icons/instagram.svg` in the footer, neither wired to any real feed —
  a live embed isn't buildable here.
- **Product-link hint**: the design node contains only 6 flat `#d9d9d9`
  rectangles named after their AdobeStock source files — no text, no
  captions, no name/price nodes like every real product-card section has
  (Best Products, Deals Of The Day, Product Details all carry those; this
  one carries nothing). No hint of a product reference.
- **Conclusion**: pure decorative lifestyle imagery, same
  unexported-AdobeStock-placeholder pattern already resolved for
  Highlights' background and Banner's panels — flat-panel fallback, no
  fabricated caption/link/product reference.
- **Mobile frame** (`7:152`, same 6 tile names, same order): confirmed
  reflow from a single row of 6 to a 3-column, 2-row grid — a genuine
  structural change, handled at the existing 900px breakpoint.
- **Layout**: tiles are exactly square at both anchors (303.68px desktop,
  103.38px mobile, both 1:1) — `aspect-ratio: 1` covers both widths, no
  clamp needed, same precedent as Banner's panels. Section is genuinely
  full-bleed in the source (first tile at `left: 0`, no gutter) — matched
  exactly rather than assumed symmetric with every other section's
  `var(--vt-gutter)` container padding.

### Files

| File | Change |
|---|---|
| `src/app/screens/homePage/Instagram.tsx` | New section component — 6 static decorative tiles, no data fetch |
| `src/app/screens/homePage/index.tsx` | Renders it between `ProductDetails` and `Statistics` (Figma y-order) |
| `src/css/home.css` | Full-bleed 6-column grid (no `--vt-gutter`/`--vt-content-max`), 900px breakpoint switches to a 3-column grid, matching the confirmed mobile frame |

### Verification (`tsc` + `build` clean)

Live headless Chromium, full width matrix plus the real measured
1440×719 window — confirmed: 6 tiles in a single row ≥900px, 3×2 grid
<900px exactly matching the confirmed mobile frame, tiles square
(`aspect-ratio` 1.000) at every width, section full-bleed (left offset
0px at every width, unlike every other section), zero text content of
any kind. Zero page errors.

## Session — Section 11 of 12: Free Shipping

A 4-item trust-badge strip (Figma node `2018:1391`, mobile counterpart
`2429:101`) — Free Shipping / 100% Secure Payment / 24x7 Customer Service
/ Free & Easy Returns. One of the more straightforward sections: no
product/backend data involved.

### What was checked

- **Content vs. real data**: none of the 4 labels claim a specific
  verifiable fact — no delivery-day count, no named payment provider, no
  support phone/hours. Generic e-commerce trust-badge copy, the same
  category as static marketing headings already kept elsewhere (Banner's
  "New Arrivals"/"Best Sellers"), unlike the specific, dropped "Delivery
  At 7 days" claim from Sections 4/6. No backend check applies; shipped
  as literal design copy.
- **Icons**: real exported SVGs (truck, card+lock, headset+"24", package
  with a return arrow), not unexported AdobeStock placeholders. Verified
  each icon visually after downloading — correct shapes, correctly
  matched to their labels. Downloaded via `download_assets` and saved
  locally (`public/icons/fs-shipping.svg`, `fs-payment.svg`,
  `fs-support.svg`, `fs-returns.svg`) rather than linked from Figma's
  temporary asset CDN, same convention as the Venturo badge.
- **Mobile frame** (`2429:101`, confirmed via full `get_design_context`):
  a genuine 2-column, 2-row grid — not the desktop's single row scaled
  down. Structural change, handled at the existing 900px breakpoint.

### Files

| File | Change |
|---|---|
| `src/app/screens/homePage/FreeShipping.tsx` | New section component |
| `src/app/screens/homePage/index.tsx` | Renders it between `Instagram` and `Statistics` (Figma y-order) |
| `src/css/home.css` | Flex row desktop (`justify-content: space-between`, `var(--vt-gutter)` container), 900px breakpoint switches to a 2×2 grid, matching the confirmed mobile frame |
| `public/icons/fs-shipping.svg`, `fs-payment.svg`, `fs-support.svg`, `fs-returns.svg` | New real icon assets, downloaded from Figma |

### Verification (`tsc` + `build` clean)

Live headless Chromium, full width matrix plus the real measured
1440×719 window — confirmed: all 4 icons load correctly at every width,
row layout ≥900px switches to a 2×2 grid <900px matching the confirmed
mobile frame exactly, text content matches the design's labels verbatim.
Zero page errors.

## Session — Section 12 of 12: Footer (final section — 12-section rebuild complete)

Figma node `2012:455` (mobile counterpart `2012:1159`). Rewrote the
existing `src/app/components/footer/index.tsx` in place (same component,
same global mount point in `App.tsx`, rendered on every page — not a new
or duplicate footer) rather than creating a second component, after
confirming the relationship by reading it directly first.

### What was checked

- **Newsletter signup**: no email-capture endpoint exists anywhere in the
  backend schema. Form renders as designed; `onSubmit` prevents default
  and does nothing — no fake "Subscribed!" state. Flagged in
  `NEXT_STEPS.md`.
- **Link columns**: real routes confirmed via `App.tsx` (`/`, `/products`,
  `/checkout`, `/orders`, `/member-page`, `/help`). The design's "Shop"
  and "Learn" columns are **literally identical content** — confirmed on
  both the desktop node and the mobile node (`2012:1159`), not a one-off
  slip. "Care," "Service," "Wholesale," "Sitemap" have no real
  destination anywhere in the app. "FAQs" does — `/help` has a real FAQ
  tab (`lib/data/faq.ts`). Consolidated to one real "Shop" column (All
  Products → `/products`, Trekking/Hiking → deep-linked via the
  already-fixed `?productCollection=` support) and a trimmed "Help"
  column (Account → `/member-page`, gated on the real `authMember` from
  `useGlobals()` — the old footer had this conditional shape but with a
  hardcoded `null` stub; wiring the real hook is a genuine fix; FAQs →
  `/help`). "Learn" dropped — no distinct real content. Flagged in
  `NEXT_STEPS.md`.
- **Contact info**: raised directly to the user — neither the new mock's
  `support@stereolabs.com`/`Location: India` nor the *old* footer's own
  `devexuz@gmail.com`/Dubai address/`+971` phone/"© Devex Global" are
  real Venturo values (the old ones are literally the template vendor's
  own identity, predating this rebuild). **Decision: omit specific
  contact details entirely.** Copyright is now a real, generic
  "© 2026 Venturo. All rights reserved."
- **Social icons**: confirmed bare `<img>` tags, no `<a>` wrapper, no
  `onclick` — decorative-only, matching the pre-existing footer's
  treatment. Explicitly re-verified live, per instruction, after the
  rewrite rather than carried forward as an assumption (a full rewrite is
  exactly where a "kept as-is" detail can silently drift) — confirmed
  unchanged at all 4 widths.
- **Back-to-top button**: a real, buildable feature (not fabricated
  data) — wired to `window.scrollTo({ top: 0, behavior: "smooth" })`.
  Live-verified: `window.scrollY` reaches exactly `0` after clicking.
- **Mobile frame** (`2012:1159`, confirmed via full `get_design_context`):
  genuine structural stack — brand/newsletter/social zone entirely above
  the nav-columns zone (desktop has them side by side). Handled at the
  existing 900px breakpoint.
- **Styled-components**: the old footer used `styled-components`, the
  only section left doing so — every other section in this rebuild uses
  a dedicated `.css` file + `className`, including the already-started
  `src/css/footer.css` for the brand lockup. Migrated fully to match.
  Also fixed the brand wordmark/tagline still using the old Burak-era
  gold (`#d7b586`) instead of this rebuild's olive/cream palette —
  caught visually during verification, not planned upfront.

### Files

| File | Change |
|---|---|
| `src/app/components/footer/index.tsx` | Full rewrite in place (same component/mount point) |
| `src/css/footer.css` | Migrated off `styled-components`; brand-lockup rules kept (color-corrected), rest rewritten for the new layout; 900px breakpoint stacks brand/newsletter above nav columns |

### Verification (`tsc` + `build` clean)

Live headless Chromium, full width matrix plus the real measured
1440×719 window, footer verified at the bottom of a real page (it's
global, not isolated):

- Zero occurrences of "stereolabs"/"Devex"/"Dubai"/"+971"/"India" text
  at any width.
- Zero "Learn" column text; exactly 2 nav columns (Shop, Help).
- Shop column hrefs confirmed real: `/products`,
  `/products?productCollection=TREKKING`,
  `/products?productCollection=HIKING`.
- Help column confirmed to show only "FAQs" when unauthenticated
  (Account correctly gated, not shown) — real conditional behavior, not
  just present in markup.
- Social icons re-confirmed unwrapped/non-interactive after the rewrite:
  no `<a>` ancestor, no `onclick`, at all 4 widths.
- Back-to-top confirmed functional: `scrollY` 9111 → `0`.
- Subscribe confirmed inert: no fake success/confirmation text appears
  anywhere on the page after submitting.
- Layout: row ≥900px, stacked column <900px, matching the confirmed
  mobile frame exactly.

Zero page errors. **This completes the 12-section homepage rebuild.**

## Session — Remove remaining old Burak-era homepage sections

With the 12-section HikMali rebuild complete, five old Burak-era sections
still sat between `FreeShipping` and `Footer` — fully superseded or pure
fabricated/decorative content. Deleted outright (files removed entirely,
not just unrendered — confirmed no reason for them to come back):
`Statistics.tsx` (fabricated stats), `PopularDishes.tsx`/`NewDishes.tsx`
("Fresh Menu," redundant with the real product data Best Products/Deals
Of The Day already show), `Advertisement.tsx` (literal Burak ad video),
`Events.tsx` (static stock photos, no real data). `ActiveUsers.tsx` was
kept — genuinely wired to real backend data
(`MemberService.getTopUsers()`) with no HikMali equivalent; only needs a
future restyle, not removal (see `NEXT_STEPS.md`).

### What was checked before deleting

- **Cross-references**: grepped each component name across `src/` —
  none imported anywhere except `homePage/index.tsx` and their own file
  (one harmless hit: a code *comment* in `Banner.tsx` mentioning
  "PopularDishes/NewDishes," not an import). Safe to delete outright.
- **Redux state**: `retrievePopularDishes`/`retrieveNewDishes`
  (`selector.ts`) and their backing state/reducers (`slice.ts`,
  `HomePageState` in `lib/types/screen.ts`) were consumed only by the two
  deleted components — removed alongside them, not left as dead
  plumbing. `retrieveTopUsers`/`setTopUsers`/`topUsers` state stay
  (`ActiveUsers` depends on them).
- **`index.tsx`'s own fetches**: the `popularDishes`/`newDishes`
  `ProductService` calls became dead once their consumers were deleted —
  removed along with the now-unused `ProductService`/`ProductCollection`/
  `Product` imports. The `member.getTopUsers()` fetch stays.
- **CSS sharing subtlety in `home.css`**: `ActiveUsers.tsx`'s own
  `.main` element only had `display`/`flex-direction`/`align-items` from
  a *scoped* `.active-users-frame .main` rule — its `margin-top: 45px`
  was actually coming from an **unscoped** `.homepage .main` rule that
  was really there for `NewDishes.tsx`'s own top-level `.main` element.
  Deleting that block outright would have silently shifted `ActiveUsers`'
  spacing. Fixed by folding `margin-top: 45px` directly into
  `.active-users-frame .main` before removing the unscoped rule.
  Live-verified: `.main`'s position relative to `.active-users-frame`
  measured **95px both before and after** the cleanup — byte-for-byte
  unchanged, not just assumed fine. Similarly, `.cards-frame`/`.card`/
  `.card:hover`/`.member-nickname`/`.nickname`/`.no-data` (also
  unscoped, under the old "ACTIVE USERS" CSS comment) are what
  `ActiveUsers.tsx` actually depends on — kept as-is;
  `PopularDishes`/`NewDishes`' own more-specific scoped versions of the
  same class names were removed since only those deleted components used
  them.
- **`public/video/burak-ads.mp4`**: only referenced in the now-deleted
  `Advertisement.tsx`. Confirmed zero remaining references anywhere in
  `src/` or `public/` after deletion — not assumed. Flagged in
  `NEXT_STEPS.md` as safe to delete, not deleted in this pass (established
  orphaned-asset convention).
- **`lib/data/plans.ts`** (Events' copy source): only consumed by the
  now-deleted `Events.tsx`. Not in the explicit deletion list; left in
  place but flagged in `NEXT_STEPS.md` as now-orphaned.

### Files

| File | Change |
|---|---|
| `Statistics.tsx`, `PopularDishes.tsx`, `NewDishes.tsx`, `Advertisement.tsx`, `Events.tsx` | Deleted |
| `homePage/index.tsx` | Removed their imports/JSX/fetches; removed now-unused `ProductService`/`ProductCollection`/`Product` imports |
| `homePage/slice.ts`, `homePage/selector.ts`, `lib/types/screen.ts` | Removed `popularDishes`/`newDishes` state, reducers, and selectors; `topUsers` untouched |
| `src/css/home.css` | Removed the `STATISTICS`, `PopularDishes`, `NEW PRODUCTS`, `ADVERTISEMENT`, `EVENTS` blocks; `ACTIVE USERS` block kept with `margin-top` folded in to preserve spacing exactly |

### Verification (`tsc` + `build` clean)

Live headless Chromium: zero leftover Burak content text anywhere on the
page. `homepage`'s direct children, in order:
`shop-by-category → best-products → home-banner → highlights →
deals-of-the-day → product-details → instagram-grid → free-shipping →
active-users-frame` (`Footer` renders separately, outside `.homepage`,
in `App.tsx`) — confirming the clean `FreeShipping` → `ActiveUsers` →
`Footer` transition with nothing old in between. `ActiveUsers`' real
member data still renders (1 real member, `qa_tester_002`), and its
`.main` spacing measured exactly 95px relative to `.active-users-frame`
both before and after the cleanup. Zero page errors.

## Session — Rebuild OtherNavbar.tsx to match the HikMali palette/structure

`OtherNavbar` is the header on every non-home route (`/products`,
`/orders`, `/help`, `/member-page`, `/checkout`) — until now still on
the old gold/dark Burak styling while `HomeNavbar` (Section 1) was
already rebuilt, so every page but `/` looked visually inconsistent.

### What was checked before building

- **Real design source, not a guessed variant**: found the actual
  non-home header via `get_metadata` on the Figma page root, locating
  the "Shop List" top-level frame (`2458:2`) and its `Header` child node
  (`2012:153`). Pulled that node's `get_design_context` directly rather
  than assuming HomeNavbar's structure would just apply. Confirmed: same
  two-bar structure (35px olive announcement topbar + 75px light `#f5f5f5`
  main nav) as `HomeNavbar`, just without the homepage-only hero — not a
  different design.
- **Nav links**: the design's own labels ("Home | Activity | Equipment |
  Men's | Women's | Pages") are generic template links with no real
  routes in this app — same class of problem `HomeNavbar`'s Section 1
  rebuild already resolved for the homepage nav. Reused that exact same
  resolution (Home/Products/Orders/My page/Help, Orders and My page
  gated on `authMember`) rather than re-deciding it, so both headers stay
  consistent with each other.
  Icons in the design (search / basket / account, in that order) match
  what already exists functionally — search links to `/products` (same
  as `HomeNavbar`'s established resolution: a real destination rather
  than a decorative, non-functional control), basket and login/avatar
  are the existing real functionality, fully preserved.
- **No separate mobile "Shop List" frame** exists in the Figma file
  (checked — only the `home`/`mob` page variants have paired mobile
  frames). Since the header content itself is confirmed identical to
  `HomeNavbar`'s nav portion, reused `HomeNavbar`'s already-established
  900px breakpoint behavior directly (drop currency selector and text
  links, shrink icons 24px→17px, shrink badge/wordmark) rather than
  guessing a new one.

### Files

| File | Change |
|---|---|
| `src/app/components/headers/OtherNavbar.tsx` | Full rewrite — same topbar+nav structure as `HomeNavbar`, same props/functionality preserved exactly (search, basket, auth menu, login) |
| `src/css/navbar.css` | Replaced the old `.other-navbar` block (gold palette, `banner.webp` background, blue login button) with rules mirroring `.home-navbar`'s `hm-*` classes, re-scoped under `.other-navbar`; same 900px breakpoint treatment |

`public/img/banner.webp` (the old header background) is now orphaned —
its only reference was the deleted CSS rule. Flagged in
`docs/ai/NEXT_STEPS.md` as safe to delete, not deleted in this pass, per
the established orphaned-asset convention.

### Verification (`tsc` + `build` clean)

Live headless Chromium, real routes (not just isolated) — `/products`
and `/help` — full width matrix plus the real measured 1440×719 window:

- Topbar background confirmed `rgb(112, 114, 98)` (`#707262`) at every
  width on both routes — real HikMali olive, not the old gold/dark.
  Zero occurrences of old Burak leftovers ("Devex", `banner.webp`).
- Real link set renders and auth-gates correctly: `Home | Products |
  Help` while unauthenticated (Orders/My page correctly absent), with
  the current route's link showing the active underline (`/products` →
  "Products" underlined).
  Text links hidden below 900px on both routes, matching `HomeNavbar`'s
  confirmed breakpoint behavior exactly.
- Search icon, basket, and Login button all present and unchanged
  functionally at every width.

Zero page errors.

## Session — Fix mobile hero copy spacing gap (logged in NEXT_STEPS.md)

Stacked mobile hero measured 895px against the Figma `mob 01` frame's
748px — the copy block was reusing desktop's 27/50/40/60px margins
verbatim rather than real mobile anchors.

### What was checked

Pulled full `get_design_context` for both hero nodes directly (desktop
`5:15`, mobile `7:144`) rather than estimating — real absolute
y-positions for eyebrow/discount/H1/sub/button on both frames. For each
of the 4 margins, computed the real value as `(next element's top) -
(previous element's top + previous element's rendered line-box height)`,
verified the methodology against the desktop side first (reproduced the
already-shipped 27px and 50px exactly this way, confirming the method is
sound) before trusting it for the mobile side (yielding 25/10/20/50px).
Converted each to a `clamp()` using the desktop-shipped value as the
upper anchor (left unchanged — already approved/live) and the freshly
measured mobile value as the lower anchor, same two-anchor pattern as
`--vt-gutter`/`--vt-h1-size`.

Two more real contributors to the overshoot were found and fixed along
the way, both mobile-only values with no desktop equivalent (so left as
plain fixed values, not clamps, per the standing convention for
single-anchor values): `.hm-hero-copy`'s margin-top (image-panel-bottom
to eyebrow-top gap) was `40px`, invented; the real `mob 01` gap is
`29px`. `.hm-hero-inner`'s bottom padding was `56px`, also invented; the
real frame has **zero** space after "Shop Now" — its bottom edge lands
exactly at the hero's own bottom edge.

Sanity check: summing all real anchor values (image panel 372px + all
corrected gaps/margins + element heights) totals exactly 748px, matching
the Figma frame's height to the pixel — confirming the derivation, not
just asserting it.

### Files

| File | Change |
|---|---|
| `src/css/navbar.css` | `.hm-hero-discount`/`.hm-hero-title`/`.hm-hero-sub`/`.hm-shop-now` margins converted to `clamp()`; `.hm-hero-copy` margin-top and `.hm-hero-inner` bottom padding corrected to real measured mobile-only values |

### Verification (`tsc` + `build` clean)

Live headless Chromium, full width matrix plus the real measured
1440×719 window. Mobile hero height: **756px** (previously 895px)
against the Figma frame's **748.07px** — a ~1% residual gap (browser
font-metric rounding, not a measurement error), down from a ~20%
overshoot. Desktop hero height unchanged at every width (still governed
by `--vt-hero-height`, untouched by this fix) — confirmed no visual
regression via screenshot at 1920/1536/1440/390 and the real window.
`NEXT_STEPS.md`'s entry marked resolved (kept, not deleted, per the
existing convention).

## Session — Real hero photography (Section 1), replacing flat placeholder panels

The hero's two split panels used flat `#ebebe8`/`#d9d9d9` fills (the
Figma AdobeStock layers were unexported placeholders). Replaced with
real photography.

### Source — the real Unsplash Search API, not the dead keyless endpoint

The originally-requested `source.unsplash.com` was checked first and
confirmed dead — a `503 Application Error` from a defunct Heroku app
(Unsplash deprecated it; verified 3x, not a transient blip), and its
would-be fallback `picsum.photos` has no topical/keyword search at all
regardless. Flagged to the user before proceeding; the user supplied a
real `UNSPLASH_ACCESS_KEY` (added to the already-gitignored
`.env.local` in the frontend repo, not `.env`, which is tracked —
confirmed `.env.local` is genuinely untracked via `git ls-files` before
and after). Used Unsplash's real Search Photos API
(`api.unsplash.com/search/photos`) with that key.

### What was searched and chosen

Two searches (`hiking mountain sunset`, `hiker backpack trail`), 5
results each, visually reviewed via downloaded preview thumbnails before
choosing:

- **Left panel**: [Diego Gennaro — "Sunset at the top of Piltriquitron, El Bolsón, Rio Negro, Argentina"](https://unsplash.com/photos/silhouette-of-person-standing-on-rock-during-sunset-JNb0yIiIaQc) (photographer: https://unsplash.com/@_nnaro_)
- **Right panel**: [lucas Favre — "man in blue and black backpack standing on rock formation during daytime"](https://unsplash.com/photos/man-in-blue-and-black-backpack-standing-on-rock-formation-during-daytime-5B-I62BwJ5E) (photographer: https://unsplash.com/@we_are_rising)

Chosen over the other candidates for sharing warm golden-hour lighting
and both featuring a lone hiker figure — a matched pair, and a clear
narrative fit for an adventure-gear brand. License: Unsplash License
(free for commercial use, no attribution legally required —
https://unsplash.com/license); credited here anyway as good practice.
Downloaded the `regular` size (1080×720, not the low-res `thumb`) via
curl into `public/img/hero-left.jpg`/`hero-right.jpg`. Per Unsplash's
API Guidelines, triggered a GET to each photo's real
`links.download_location` endpoint once (required when a photo is
actually used, not just browsed) — confirmed 200 responses from both.

### Real problems found and fixed along the way

- **CSS `url()` doesn't work for public-folder assets in this CRA
  project**: `background-image: url("/img/hero-left.jpg")` in the CSS
  file failed the build — `Module not found: Error: Can't resolve
  '/img/hero-left.jpg' in '.../src/css'`. CRA's css-loader tries to
  resolve a CSS `url()` as a webpack module import, which fails for a
  path that only exists in `public/`, not `src/`. No precedent for this
  pattern exists anywhere else in the codebase — every other public
  asset is referenced as a plain runtime string
  (`<img src="/icons/...">`). Fixed by setting `backgroundImage` inline
  in `HomeNavbar.tsx` instead, matching that existing convention;
  `background-size`/`background-position` stayed in the CSS file.
- **Text illegible against the real photos, confirmed by actual
  measurement, not eyeballing**: built a real pixel-sampling script
  (Playwright screenshot → canvas → WCAG relative-luminance contrast
  ratio) rather than judging by eye. Initial directional panel-wide
  gradient measured **1.01:1** contrast behind "Hot Deals" — the photo's
  brightness swings enormously from bright sky at the text block's top
  to already-dark rock at its bottom, which a single directional
  gradient can't track. Switched to a scrim sized to each text block
  itself (`::before` on `.hm-hero-copy`/`.hm-hero-offer`, padded inset,
  `backdrop-filter: blur`, rounded corners) — guarantees contrast
  regardless of what's behind it at any point, not just tuned to look
  right in one screenshot.
  **Found and documented a real ceiling, not silently claimed full
  compliance**: the design's own `#707262` olive eyebrow/body text color
  tops out at a **maximum possible 4.27:1** contrast ratio against pure
  black (WCAG AA normal-text requires 4.5:1) — mathematically
  unreachable without changing the text color, which was explicitly
  ruled out. Landed the scrim at **3.63:1** measured — passes AA for
  large text (3:1) comfortably and is close to that ceiling. The white
  "Get 25% Off" text on the right panel has no such ceiling (tops out
  around 21:1) and is comfortably past AA at the chosen opacity.
- **Mobile regression from the scrim fix, caught by re-measuring, not
  assumed fine**: `.hm-hero-copy`'s mobile breakpoint sets
  `position: static`, which broke the scrim's `::before`
  positioning — a `position:absolute` pseudo-element needs its own
  parent to be a positioning context, and `static` sent it escaping
  upward to `.hm-hero` instead, detached from the text. Fixed to
  `position: relative` (preserves normal flow, restores the containing
  block) — but doing so re-activated the base desktop rule's
  `left: calc(var(--vt-gutter) + 58px)` offset (which `static` had been
  silently ignoring), shifting the whole mobile copy block ~78px
  off-centre and clipping text against the viewport edge. Caught via
  live re-measurement (`boundingBox()` showing `x: 98` instead of the
  expected `20`), fixed by explicitly resetting `left: auto` alongside
  `position: relative`. Also: the scrim itself is hidden entirely on
  mobile (`.hm-hero-copy::before { display: none; }`) — mobile's copy
  block sits below the stacked image on the plain `#ebebe8` ground, not
  over a photo, so a dark card there would be an unexplained visual
  element with nothing to justify it.

### Files

| File | Change |
|---|---|
| `public/img/hero-left.jpg`, `hero-right.jpg` | New real photography, downloaded from Unsplash |
| `src/app/components/headers/HomeNavbar.tsx` | Inline `backgroundImage` style on both hero panels |
| `src/css/navbar.css` | `background-size`/`position: cover`/`center` on panels; scrim `::before` on `.hm-hero-copy`/`.hm-hero-offer`; mobile-breakpoint fixes for the scrim's positioning context and the reactivated `left` offset |
| `venturo-react/.env.local` (not `.env`) | `UNSPLASH_ACCESS_KEY` — gitignored, confirmed untracked |

### Verification (`tsc` + `build` clean)

Live headless Chromium, full width matrix plus the real measured
1440×719 window. Hero height unchanged from before this session at every
width (1920/1536/1440: 702px; 390: 756px) — confirmed no layout shift.
Contrast re-measured after every fix, not just visually re-checked:
eyebrow text 1.01:1 → 3.63:1 (against a mathematically-confirmed 4.27:1
ceiling for this text color). Mobile copy block confirmed centred
(`x: 20`, matching the gutter) after the `left: auto` fix, no clipping.
Zero page errors.

## Session — Real Shop by Category photography (Section 3)

`ShopByCategory.tsx`'s 5 flat `#d9d9d9` cards replaced with real
photography, same pipeline as the hero (real Unsplash Search API,
`.env.local` key, `regular`-size downloads, required
`download_location` tracking call per photo).

### Correction to the task's premise, checked before building

The task described the category label as "overlaid text at the bottom"
of the photo. Checked against both the live markup and the real Figma
node (`2479:1302`) before assuming that was true: it isn't. The label
(`sbc-card-label`) is a separate caption *below* the 450px media block
(`margin-top: 32px`, not `position: absolute`), and the Figma source
places the label text at y=1678 — well below the media block's own
bottom edge at y=1642. It sits on the section's plain white background,
not on the photo. Legibility was still measured, not skipped on the
strength of this correction alone (see below).

### The 5 photos

Real Unsplash Search API (`api.unsplash.com/search/photos`), one search
per category tied to the real `ProductCollection` each card links to
(not the marketing label), 5 results each, picked visually from
downloaded preview thumbnails:

| Category (label) | Collection | Photo | Photographer |
|---|---|---|---|
| Climbing | `CLIMBING` | ["Going Up, Smith Rock State Park, Oregon"](https://unsplash.com/photos/man-in-black-shorts-climbing-brown-rock-formation-during-daytime-VnmbcgAfL3Q) | Sean Benesh (https://unsplash.com/@seanbenesh) |
| All Brand Tenting | `CAMPING` | ["Camping Under the Stars"](https://unsplash.com/photos/brown-dome-tent-near-trees-at-night-8f_VQ3EFbTg) | Josh Hild (https://unsplash.com/@joshhild) |
| Warm & Cool Jacket | `APPAREL` | ["a person with a backpack standing on a cliff"](https://unsplash.com/photos/a-person-with-a-backpack-standing-on-a-cliff-StfgyoFRnwE) | Alexander Kaufmann (https://unsplash.com/@alexander_kaufmann) |
| Hiking Shoes | `FOOTWEAR` | ["...standing on rock during daytime"](https://unsplash.com/photos/person-in-black-pants-and-brown-leather-boots-standing-on-rock-during-daytime-4s-obffdob0) | Ali Kazal (https://unsplash.com/@lureofadventure) |
| Trekking | `TREKKING` | ["person admires scenic mountains and a sunny sky"](https://unsplash.com/photos/person-admires-scenic-mountains-and-a-sunny-sky-Mkvr1r3704o) | Samuel Malmström (https://unsplash.com/@samuelmalm) |

Chosen for a cohesive look across the row (each features a lone
adventurer figure against a dramatic landscape, matching the hero
photos' narrative) and for surviving a portrait `cover` crop without
losing the subject — checked visually per candidate, not just picked
by description. License: Unsplash License (free for commercial use, no
attribution legally required — https://unsplash.com/license); credited
above as good practice. Downloaded via curl into `public/img/`, named by
the real `ProductCollection` value
(`category-climbing.jpg`/`category-camping.jpg`/`category-apparel.jpg`/
`category-footwear.jpg`/`category-trekking.jpg`), not the marketing
label. All 5 `download_location` tracking calls confirmed 200.

### Files

| File | Change |
|---|---|
| `public/img/category-*.jpg` (5 files) | New real photography, downloaded from Unsplash |
| `src/app/screens/homePage/ShopByCategory.tsx` | `CATEGORIES` array gains an `image` field; inline `backgroundImage` style per card (same CRA `url()`-in-CSS workaround established for the hero) |
| `src/css/home.css` | `.sbc-card-media` gains `background-size: cover; background-position: center;` (previously a flat colour only, no image to size/position) |

### Verification (`tsc` + `build` clean)

Live headless Chromium, full width matrix plus the real measured
1440×719 window: all 5 images confirmed loading (not the flat fallback
colour) at every width; card dimensions, gutter offsets, and scroller
behaviour all unchanged from the placeholder version (390×450, same x
offsets at every width: 150/117.4/109.2/20px, matching the already-
proven `--vt-gutter` values). Legibility measured with the same
pixel-sampling contrast script built for the hero, not assumed from the
caption-vs-overlay correction alone: **4.92:1** (white section
background vs. the same `#707262` text) — passes full WCAG AA for
normal text outright, no scrim needed. Zero page errors.

## Session — Real Banner photography (Section 5)

`Banner.tsx`'s two flat `#d9d9d9` panels ("New Arrivals" / "Best
Sellers") replaced with real photography, same Unsplash pipeline as the
hero and Shop by Category.

### Layout confirmed before building, not assumed

Checked `home.css` directly: `.hb-panel-content` (holding the eyebrow,
heading, and CTA) is a sibling positioned *over*
`.hb-panel-media` (`position: absolute; inset: 0`) — an overlay layout
like the hero, not a caption-below layout like Shop by Category. The CTA
button already has its own solid white fill, so only the eyebrow/heading
text was ever at legibility risk.

### The 2 photos

Real Unsplash Search API, picked for good negative space (a single
product shot survives an asymmetric corner-text overlay far better than
a symmetric flatlay — several flatlay candidates for "New Arrivals" were
rejected for exactly this reason after previewing them):

| Panel | Photo | Photographer |
|---|---|---|
| New Arrivals | ["green and black backpack on brown wooden log"](https://unsplash.com/photos/green-and-black-backpack-on-brown-wooden-log-9aZ3T1q83CM) | Ali Kazal (https://unsplash.com/@lureofadventure) — same photographer as the "Hiking Shoes" category photo, coincidental, not a licensing issue |
| Best Sellers | ["grey and black hiking backpack and cyan tumbler on grey rock during sunset"](https://unsplash.com/photos/grey-and-black-hiking-backpack-and-cyan-tumbler-on-grey-rock-during-sunset-8sjBzL1IyMo) | Josiah Weiss (https://unsplash.com/@jsweissphoto) |

License: Unsplash License (free for commercial use, no attribution
legally required — https://unsplash.com/license); credited above as
good practice. Downloaded via curl into `public/img/` as
`banner-new-arrivals.jpg`/`banner-best-sellers.jpg`. Both
`download_location` tracking calls confirmed 200.

### Legibility — measured per breakpoint, not just per panel

Same pixel-sampling contrast script as the hero and Shop by Category,
but this section surfaced a new lesson: **`background-size: cover`
recrops the same photo differently at different panel widths**, so a
single desktop-only measurement isn't sufficient — contrast has to be
checked at every breakpoint, not just once per panel.

- **New Arrivals**: failed everywhere (1.85:1 at 1920, similar at other
  desktop widths) against this photo's mid-toned blurred-forest crop.
  Added a scrim (`.hb-panel-copy-scrim`) sized to the copy block, same
  technique as the hero. Final measured contrast: 3.97:1 (1920) /
  3.45:1 (1536) / 3.41:1 (1440) / 4.02:1 (390) — passes the AA
  large-text threshold (3:1) at every width.
- **Best Sellers**: passed comfortably on desktop (4.92:1 at every
  desktop width, its photo's bright-sky crop) — but the *same* panel
  measured **1.27:1 at 390px**, because the mobile crop centres on a
  busier, warmer part of the photo. Caught by explicitly re-measuring
  at all 4 widths rather than assuming the desktop result transferred
  down. Added a second, mobile-only scrim
  (`.hb-panel-copy-scrim-mobile`, scoped inside the existing 900px
  structural breakpoint) — final measured contrast: 3.52:1 at 390px,
  desktop widths unaffected (still 4.92:1, no scrim applied there).

### A real CSS bug found and fixed along the way

The first scrim attempt (`z-index: -1` on the `::before`) rendered
completely inert — contrast measured unchanged (1.85:1 → 1.85:1) despite
the scrim visibly being dark in a screenshot crop. Root cause: none of
`.hb-panel`/`.hb-panel-content`/`.hb-panel-copy` set `z-index` alongside
their `position`, so none of them establish an actual CSS stacking
context — a `z-index:-1` there escapes past all of them and paints
behind `.hb-panel-media` (the photo) entirely, not just behind the text.
Removing `z-index` and relying on plain DOM paint order didn't work
either: per CSS's default painting order, a *positioned* element (even
at `z-index: auto`) paints **after** normal in-flow inline content
regardless of DOM order — so the scrim landed on top of the text, not
behind it (confirmed via screenshot: text was present, at its correct
computed color, just fully obscured). Fixed by making the stacking order
explicit rather than relying on default behavior: `z-index: 0` on
`.hb-panel-copy-scrim` (now a real stacking context, since it has both
`position` and a non-auto `z-index`) and `z-index: 1` on the eyebrow/
heading spans inside it.

### Files

| File | Change |
|---|---|
| `public/img/banner-new-arrivals.jpg`, `banner-best-sellers.jpg` | New real photography, downloaded from Unsplash |
| `src/app/screens/homePage/Banner.tsx` | `PANELS` array gains `image`/`needsScrim`/`needsScrimMobile` fields; inline `backgroundImage` style per panel |
| `src/css/home.css` | `.hb-panel-media` gains `background-size: cover; background-position: center;`; new `.hb-panel-copy-scrim`/`.hb-panel-copy-scrim-mobile` rules with explicit stacking (see above) |

### Verification (`tsc` + `build` clean)

Live headless Chromium, full width matrix plus the real measured
1440×719 window: both images confirmed loading at every width; panel
aspect ratio held exactly at 8:7 (1.143) at every width, matching the
already-established `aspect-ratio: 8/7` — no layout shift. Both hrefs
confirmed resolving correctly (`/products?order=createdAt`,
`/products?order=productViews`) at every width via live DOM inspection,
not just visually. All 8 panel×width contrast combinations re-verified
≥3.4:1 after the fixes above. Zero page errors.

## Session — Real Highlights photography (Section 6)

`Highlights.tsx`'s flat `#d9d9d9` full-bleed background (2.4:1) replaced
with a real photo, same Unsplash pipeline as every prior section.

### The photo

**Corrected 2026-09-02 — re-sourced for a stronger shot, see the session
below.** [Pure Brasov — "Hikers on a path through a green mountain
landscape"](https://unsplash.com/photos/hikers-on-a-path-through-a-green-mountain-landscape-SaXhw2RwDrI)
(https://unsplash.com/@purebrasov). Was Toomas Tartes' "Hikers on trail
toward mountain peaks" — that photo worked but was visually flatter than
this one's layered, jagged ridgelines and visible hiking group for scale.
License: Unsplash License (free for commercial use, no attribution
legally required); credited above as good practice. Downloaded via curl
into `public/img/highlights.jpg` (same filename, in-place replacement).
`download_location` tracking call confirmed 200.

### Legibility — re-measured for the new photo, per breakpoint

Same pixel-sampling contrast script as before, re-run because a
different photo can need a different scrim strength — confirmed true
this time: unlike the original photo, this section's fixed-height
`.highlights` box (`aspect-ratio: 2.4`, so height = width ÷ 2.4)
combined with `.hl-heading`'s **fixed** `top: 595px` means the heading
is only fully on-screen at 1920/1536; at 1440 the section is 600px tall
and the heading (595–627px) is clipped to a ~5px sliver by
`.highlights`' `overflow: hidden` — a **pre-existing responsive bug,
unrelated to either photo** (a scrim cannot fix clipping), discovered
while re-measuring and left unfixed as out of scope for this photo
re-source; flagging here rather than silently working around it.

| Width | Heading visible | Background sample | Contrast ratio |
|---|---|---|---|
| 1920 | yes | rgb(114,125,95) | **4.36:1** (AA, large text) |
| 1536 | yes | rgb(121,133,119) | **3.86:1** (AA, large text) |
| 1440 | **clipped to ~5px by the bug above — not meaningfully measurable**, not a photo/contrast issue | n/a | n/a |
| 390 | **no** — confirmed hidden (`display:none`), matching the confirmed mobile frame (7:148), which has neither the heading, tick, nor cross markers at all | n/a | n/a, not measured — nothing to measure |

Both measurable widths clear the AA large-text threshold (3:1) — no
scrim added, per the same "don't apply one speculatively" discipline as
every prior section. Margin is tighter than the previous photo's
(4.26/6.73:1 → 4.36/3.86:1), worth keeping in mind if this photo is
ever replaced again. The 1440 clipping bug should get its own look: fix
would be sizing `.hl-heading`'s `top` proportionally (e.g. a `%` value
or a `--vt-*` fluid token) instead of a fixed px anchored to the 1920
frame.

### Files

| File | Change |
|---|---|
| `public/img/highlights.jpg` | New real photography, downloaded from Unsplash |
| `src/app/screens/homePage/Highlights.tsx` | Inline `backgroundImage` style on `.hl-media` |
| `src/css/home.css` | `.hl-media` gains `background-size: cover; background-position: center;` (previously a flat colour only) |

### Verification (`tsc` + `build` clean)

Live headless Chromium, full width matrix plus the real measured
1440×719 window: `2.4` aspect ratio held exactly at every desktop width
(1920/1536/1440), real photo confirmed loading, card and layout
unchanged (no layout shift). Mobile (390) confirmed the heading/tick/
cross markers are genuinely absent via `isVisible()`, not just assumed
from reading the CSS. Zero page errors.

## Session — Real Instagram grid photography (Section 10)

`Instagram.tsx`'s 6 flat `#d9d9d9` placeholder tiles replaced with real
photography, same Unsplash pipeline as every prior section. No text
overlays these tiles (re-confirmed against both the source and the live
markup — no caption/heading elements at all here, unlike every section
with an actual legibility concern), so no contrast measurement applied.

### The 6 photos

Six separate searches, one per intended mood, checked against every
photographer already used elsewhere on the page to avoid repeats:

| Tile | Search term | Photo | Photographer |
|---|---|---|---|
| 1 — gear detail | hiking gear detail | ["man in blue shirt and brown pants walking on bridge"](https://unsplash.com/photos/man-in-blue-shirt-and-brown-pants-walking-on-bridge-during-daytime-chEYjgqdJ7k) | Patrick Pahlke (https://unsplash.com/@p_pixels_p) |
| 2 — friends | friends hiking laughing | ["a man taking a picture of a woman with a camera"](https://unsplash.com/photos/a-man-taking-a-picture-of-a-woman-with-a-camera-4bihbNN517U) | Geoffrey Chevtchenko (https://unsplash.com/@geoffreychevt) |
| 3 — solo silhouette | silhouette hiker sunset | ["a person with a backpack walking up a hill"](https://unsplash.com/photos/a-person-with-a-backpack-walking-up-a-hill-2LxcsQVV_Vk) | Alisha Limbu (https://unsplash.com/@alisha_limbu) |
| 4 — campfire | campfire evening camping | ["a close up of a fire in the dark"](https://unsplash.com/photos/a-close-up-of-a-fire-in-the-dark-Q0rPpApx9mY) | Avakyan Artyom (https://unsplash.com/@low2pow) |
| 5 — trail coffee | camping coffee morning (the suggested "coffee camping trail" returned 0 results — checked, not assumed, before switching terms) | ["person pouring water on silver steel cup"](https://unsplash.com/photos/person-pouring-water-on-silver-steel-cup-GMXwbCx8jcM) | McKayla Crump (https://unsplash.com/@funkmastacrump) |
| 6 — summit | summit celebration hiker | ["a man standing on a rock overlooking a lake and mountains"](https://unsplash.com/photos/a-man-standing-on-a-rock-overlooking-a-lake-and-mountains-7iLFhbiWNHc) | Susan Flynn (https://unsplash.com/@misssusanflynn) |

License: Unsplash License (free for commercial use, no attribution
legally required — https://unsplash.com/license); credited above as
good practice. Downloaded via curl into `public/img/` as
`instagram-1.jpg` through `instagram-6.jpg`. All 6 `download_location`
tracking calls confirmed 200.

### Files

| File | Change |
|---|---|
| `public/img/instagram-1.jpg` through `instagram-6.jpg` | New real photography, downloaded from Unsplash |
| `src/app/screens/homePage/Instagram.tsx` | Static `TILES` array replaces the plain tile-count loop; inline `backgroundImage` style per tile |
| `src/css/home.css` | `.ig-tile` gains `background-size: cover; background-position: center;` (previously a flat colour only) |

### Verification (`tsc` + `build` clean)

Live headless Chromium, full width matrix plus the real measured
1440×719 window: all 6 real photos confirmed loading at every width;
tile `aspect-ratio` measured exactly `1.000` (square) at every width via
live `getBoundingClientRect()`, not just the CSS declaration; grid
confirmed as a 6-column row ≥900px collapsing to the confirmed 3-column
(3×2) mobile layout at 390px, matching the mobile frame (7:152). No
layout shift. Zero page errors.

## Session — Replace QA test catalog with real, customer-presentable products

The `qa_pagination_test_*` catalog (5 items, no images, placeholder
names/descriptions) was standing in as the entire product catalog since
early backend testing. Replaced with 7 real products, created through
`POST /admin/product/create` — the real session-based admin create
flow — rather than a DB insert. This is the first time that endpoint has
been exercised with real, varied data; previously it had only ever
handled a single throwaway test product early in backend development.

### Real admin flow, not a shortcut

Logged in via `POST /admin/login` (session cookie, not JWT — confirmed
via `/admin/check-me` before proceeding). Checked the actual controller
(`product.controller.ts`'s `createNewProduct`) and the admin form
(`views/products.ejs`) before assuming field names — confirmed
`productImages` is a `multer` array field (max 5 files) and that
`productStatus` is read directly from the submitted form body, defaulting
to `PAUSE` when the admin UI's own hidden field is used. Passed
`productStatus=PROCESS` explicitly on every create call so the products
are actually live, not silently stuck in the admin form's own default
paused state.

### The 7 products and their real photos

Each photo sourced individually via Unsplash's Search API (same pipeline
as every prior photography session), picked for a clean product-focused
or product-in-use shot rather than a scenic lifestyle image, and checked
against every photographer already used elsewhere on the site to avoid
repeats:

| Product | Collection | Price | Size | Left | Photo | Photographer |
|---|---|---|---|---|---|---|
| Alpine Ascent Climbing Harness | CLIMBING | $89 | NORMAL | 14 | ["person with blue safety harness on focus photo"](https://unsplash.com/photos/person-with-blue-safety-harness-on-focus-photo-vJICk89hFbU) | DiEGO MüLLER (https://unsplash.com/@di360muller) |
| 3-Person Dome Tent | CAMPING | $179 | LARGE | 9 | ["a group of tents on a field"](https://unsplash.com/photos/a-group-of-tents-on-a-field-K81YThadgfM) | Pattanapong Tuamkhum (https://unsplash.com/@pattanapong_studio) — **corrected 2026-09-02, see session below; was Kampbros' "a tent pitched up in a field with trees in the background"** |
| Trailblazer 40L Hiking Backpack | HIKING | $129 | NORMAL | 17 | ["person holding black and brown Vinta backpack"](https://unsplash.com/photos/person-holding-black-and-brown-vinta-backpack-O_bhy3TnSYU) | Jakob Owens (https://unsplash.com/@jakobowens1) |
| Summit Trekking Poles (Pair) | TREKKING | $45 | NORMAL | 20 | ["hiking poles rest on dry grass"](https://unsplash.com/photos/hiking-poles-rest-on-dry-grass-QBvikej4dIw) | Vladyslav Tobolenko (https://unsplash.com/@tobolenkoph) |
| All-Terrain Cycling Helmet | CYCLING | $69 | NORMAL | 12 | ["a black helmet with holes on the side of it"](https://unsplash.com/photos/a-black-helmet-with-holes-on-the-side-of-it-rw8jnGPJpho) | Jan Kopřiva (https://unsplash.com/@jxk) |
| Insulated Trail Jacket | APPAREL | $149 | LARGE | 8 | ["a man in a hooded jacket standing in the woods"](https://unsplash.com/photos/a-man-in-a-hooded-jacket-standing-in-the-woods-MiAX_a8Qtns) | Rydale Clothing (https://unsplash.com/@rydaleclothing) |
| Waterproof Hiking Boots | FOOTWEAR | $119 | NORMAL | 16 | ["brown and white lace up boot"](https://unsplash.com/photos/brown-and-white-lace-up-boot-cHxZmiziwMI) | Colton Sturgeon (https://unsplash.com/@coltonsturgeon) |

License: Unsplash License (free for commercial use, no attribution
legally required — https://unsplash.com/license); credited above as good
practice. All 7 `download_location` tracking calls confirmed 200 before
upload. Descriptions are plain, honest one-sentence summaries of what
each item actually is — no fabricated technical specs (no invented
denier/weight/temperature-rating numbers), no marketing hype.

### The 5 `qa_` test products — paused, not deleted

`POST /admin/product/:id` with `{ productStatus: "PAUSE" }` for each of
the 5 remaining `qa_pagination_test_*` items — the same reversible
mechanism already used elsewhere to remove a product from the public
`GET /product/all` listing without destroying the underlying test data.

### Verification

`GET /product/all` confirmed to return **exactly 7 products**, zero
`qa_`-named items, immediately after both the creates and the pauses
(response captured in full — see chat transcript). Live-checked the
frontend, not just the API: homepage `Best Products`, `Deals Of The Day`,
`Highlights`, and `Product Details` sections all confirmed rendering real
product names (e.g. `Highlights` → "Alpine Ascent Climbing Harness",
`Product Details` → "3-Person Dome Tent" — the current highest-priced
item, matching that section's real sort); `/products` listing and a
product detail view also checked. Zero occurrences of
`qa_pagination_test` text anywhere on either page. Uploaded product image
confirmed actually loading (not broken) via live `naturalWidth`/`complete`
check against the real `uploads/products/` path.

No frontend code changes were needed or made — this was pure backend
data, confirmed via `git status` in the frontend repo before considering
this done.

## `ActiveUsers.tsx` restyled to HikMali conventions (frontend)

Resolves the "`ActiveUsers.tsx` needs a HikMali-consistent restyle" flag
in `docs/ai/NEXT_STEPS.md`. Real top-viewed member data
(`retrieveTopUsers` / `MemberService.getTopUsers()`) was already correct
and untouched — this was purely a visual rebuild.

Dropped `@mui/joy` entirely (`Card`, `CardOverflow`, `AspectRatio`,
`CssVarsProvider`, `Typography`) — `ActiveUsers.tsx` was the last
remaining consumer in the codebase, confirmed via
`grep -rn "@mui/joy" src/` returning zero import matches after the
rewrite. Replaced with plain `className` markup on `home.css`, matching
how `Footer` dropped `styled-components` earlier in this rebuild.
`@mui/joy` also removed from `package.json`/`package-lock.json`
(`npm uninstall @mui/joy --legacy-peer-deps`, required because of a
pre-existing `@material-ui/core@4` vs `@mui@7` peer-dep conflict
unrelated to this change). Production bundle shrank ~20 kB gzipped as a
result.

No dedicated HikMali Figma node exists for this section (it has no
counterpart among the 12 real HikMali sections — kept from the old Burak
build specifically for its live data wiring). Per the task's explicit
instruction, checked the Testimonial section (node `7:122`) as the
closest real design anchor instead of inventing proportions: circular
`size-[58px]` avatar photo, Montserrat Medium 14px name, `#aeb192` 14px
secondary line, `#f5f5f5` card background with `4px 4px 4px
rgba(0,0,0,0.1)` shadow. Reused the same circular shape, Montserrat
weights, and palette, scaled up to 140px since this section highlights a
single featured member rather than a small review credit — proportions
justified by, not copied verbatim from, the anchor.

New markup: `.active-users > .au-inner > (.au-title, .au-row >
.au-card > (.au-avatar, .au-nickname))`. Uses `--vt-gutter`,
`--vt-content-max`, `--vt-section-y` tokens (no new tokens introduced),
Montserrat font stack, `#707262`/`#f5f5f5`/`#aeb192` palette — consistent
with every other rebuilt homepage section. `member.memberImage ||
"/icons/default-user.svg"` fallback logic preserved character-for-character.

Old unscoped `.cards-frame`/`.member-nickname`/`.nickname`/`.no-data`
selectors in `home.css` fully removed and replaced with scoped
`.active-users .au-*` selectors. Confirmed via
`grep -rn "cards-frame|member-nickname|active-users-frame|no-data" src/app`
that `Products.tsx` (productsPage) also uses a bare `.cards-frame`/
`.no-data` pair — unaffected, since the old `home.css` rules were already
scoped under `.homepage` and Products.tsx isn't nested there; the new
`.active-users`-scoped rules make the separation unambiguous either way.

Also resolves the `'ProductCollection' is defined but never used`
ESLint warning previously flagged for this file in
`docs/ai/NEXT_STEPS.md` (the whole file was rewritten; that unused
import no longer exists).

### Verification

`npx tsc --noEmit` clean, `npm run build` succeeds (no new warnings —
all ESLint output is pre-existing and unrelated). Live Playwright
screenshots at 1920/1536/1440/390 plus the real measured 1440×719
window: `qa_tester_002` (the real top-viewed member) renders correctly
at every width, circular avatar with correct 140×140 box confirmed via
`boundingBox()`, zero `[class*='Joy']` elements found on the page at any
width. Full-page screenshot at 1440 confirmed no layout shift in
Free Shipping (above) or Footer (below) — section flows cleanly between
them.

## Session — Re-source Dome Tent photo + create 3 real members

### Task 1: "3-Person Dome Tent" photo replacement

The original Kampbros photo (flat, dull lighting) was the visibly
weakest of the 7 product photos. Replaced via Unsplash's Search API
(same pipeline as the original catalog session): searched "camping tent
sunny", "dome tent product clean", and "tent campsite bright daylight" —
the first two returned mostly off-topic results (scenic landscapes,
unrelated dome buildings), the third surfaced the pick. Previewed 4
tent-focused candidates from that third search before choosing
Pattanapong Tuamkhum's bright-sky, sharp-focus, front-facing tent shot —
clearly cleaner and better-lit than the alternatives (one backlit/dim,
one overcast/dull like the original, one moody dusk shot). No
photographer collision with any existing catalog credit.
`download_location` tracking call confirmed 200 before use. Table entry
above corrected in place (not appended) since this replaces previously
documented data, not new data.

**Admin update path gap, flagged as instructed**: `POST
/admin/product/:id` (`updateChosenProduct`) has no `multer`/uploader
middleware in `router-admin.ts` — only `POST /admin/product/create`
does. So it does not support multipart image replacement; it accepts an
arbitrary JSON body forwarded straight to
`findByIdAndUpdate(id, req.body)` with no field whitelist. Used the real
authenticated admin session (`POST /admin/login` with the existing
`Admin` account, confirmed via `/admin/check-me`) to call this endpoint
with `{ productImages: ["uploads/products/<uuid>.jpg"] }` — the new file
was placed on disk first, under the same `uploads/products/<uuid>.<ext>`
naming convention `libs/utils/uploader.ts`'s multer storage uses, so the
real serving path is unaffected. This is the real HTTP admin API, not a
direct DB write, but is a workaround for a genuine gap: **the admin
update endpoint cannot itself receive an uploaded file for an existing
product** — flagging for a possible follow-up (`makeUploader("products")
.array("productImages", 5)` could be added to the `/product/:id` route
the same way `/product/create` has it).

Old image (`uploads/products/1c207440-06a3-4edf-8889-e415edafa09d.jpg`)
is now orphaned — left in place, not deleted, per the established
orphaned-asset convention (flag rather than silently remove).

### Task 2: 3 real member signups

Created via the real `POST /member/signup` endpoint (JSON body, no
`multer` on this route either — confirmed in `router.ts`), each
followed by a login-scoped `POST /member/update` call (this route *does*
have real multipart support: `uploader("members").single("memberImage")`
+ `verifyAuth`) to attach a real Unsplash-sourced profile photo. No DB
shortcut anywhere in this flow.

| Nickname | Phone | Address | Bio | Photo | Photographer |
|---|---|---|---|---|---|
| james_summitseeker | 5551234567 | 14 Cedar Ridge Rd | Weekend summit hiker, always chasing sunrise views. | ["Chin up"](https://unsplash.com/photos/pUhxoSapPFA) | Jeffrey Keenan |
| elena_mossytrail | 5552345678 | 27 Fernwood Ln | Slow-hiking through mossy forest trails, camera always in hand. | ["Young woman rests against mossy wall on a wooden path"](https://unsplash.com/photos/-Y9aXsLJyBk) | Ian Edokov |
| noah_backcountry | 5553456789 | 9 Windgap Ct | Backcountry backpacker, three-season camper, gear nerd. | ["smiling man with green mountaineering bag during daytime"](https://unsplash.com/photos/3Y366aqddJ0) | Mike Baker |

Phone numbers follow the existing `qa_tester_002` fake-but-valid
10-digit format (`555` prefix). All three created as `memberType: USER`
/ `memberStatus: ACTIVE` — not admins. Each photo's `download_location`
tracking call confirmed 200. No photographer collision with any existing
credit (product photos or these three).

### Verification (batched, both tasks)

`GET /product/all` confirmed the tent's `productImages` now points at
the new file. Live Playwright check: new tent photo renders on the
homepage (Best Products, Deals of the Day, Highlights — 3 occurrences)
and on `/products/:id`'s detail page — bright sky, sharp tent, clean
composition, confirmed visually via screenshot, clearly stronger than
the old flat/dull photo. `GET /admin/user/all` (SSR EJS, not JSON —
grepped the rendered HTML) confirms all 3 new nicknames plus the
original `qa_tester_002` are present. `GET /member/top-users` still
returns only `qa_tester_002` (`memberPoints: 3` vs. the new members'
default `0`) — expected and correct, not a bug: `ActiveUsers.tsx`
already handles any array length/content, no frontend code change
needed or made.

No frontend repository changes in this session — pure backend data
session, confirmed via `git status` in the frontend repo before
considering this done.

## Session — Homepage image/design audit and fix pass (frontend + admin data)

### Task 1: Product image sizing fixed across every homepage card

Root cause: `.bp-card-media img` (Best Products) and `.pd-main-image`
(Product Details) both used `max-width/max-height: ~60-68%` +
`object-fit: contain` + `opacity: 0.65` — a leftover treatment from
before real product photography existed, sized for a small faded
placeholder icon rather than a real photo. Any source photo not close to
square rendered visibly smaller than the others in the same row (worst
case: Alpine Ascent Climbing Harness's wide/short photo, which
`object-fit: contain` shrank hard to fit `max-height`), producing the
"3 consistent + 1 oddly small" symptom.

Fixed in `src/css/home.css`:
- `.bp-card-media`: fixed `height: 320px` (`220px` at the ≤900px
  breakpoint) instead of a flex-grow filler; `.bp-card-media img` now
  `width/height: 100%` + `object-fit: cover` (opacity/max-width/contain
  removed).
- `.pd-main-image`: same change — `100%`/`100%`/`cover`, no more
  68%-scaled faded placeholder look.
- `.pd-thumb img`: `object-fit: contain` → `cover`, for the same
  uniform-fill reasoning (the container is already a fixed 116×116/
  107×107 box).
- Since `.bp-card-media`/`.pd-main-image` no longer flex-grow to
  absorb variable description-text height, `.bp-add`/`.dd-add` (the
  "Add To Cart" bar) now get `margin-top: auto` so they stay pinned to
  the card's bottom edge regardless of description length — preserving
  the original "flush to bottom" design intent documented in the code
  comment there.

**Real bug found beyond sizing**: `DealsOfTheDay.tsx` rendered no
product image at all — no `<img>`, no `dd-card-media` element, nothing
in the JSX or CSS. Added a `dd-card-media` block (same
`serverApi`/`productImages[0]` fallback pattern used everywhere else)
to `DealsOfTheDay.tsx`, plus a matching `.dd-card-media`/`.dd-card-media
img` CSS block mirroring the fixed Best Products treatment. Also removed
`.dd-card`'s `justify-content: space-between` (was spacing the now-3
children apart instead of stacking them; replaced by the same
`margin-top: auto` button-pinning approach as Best Products).

Highlights' single card was checked and left as-is — by design (see the
existing code comment) it has no per-card product photo; the section's
large lifestyle background photo is the only image there, already
`background-size: cover`.

Verified by live Playwright screenshots at 1920/1440/390 of Best
Products, Deals Of The Day, and Product Details: all 4 cards in each
grid now render their photos at identical visual size/proportion
regardless of source aspect ratio, confirmed by eye against the actual
render, not just the CSS diff. `npx tsc --noEmit` and `npm run build`
both clean.

### Task 2: Active Users now surfaces a real new member

`getTopUsers` sorts by `memberPoints` (`$gte: 1`, limit 4) — the 3
members created in the prior session all had the JSON-signup default of
`0`, so `qa_tester_002` (`memberPoints: 3`) kept winning by design, not
bug. Fixed via the real `POST /admin/user/edit` endpoint (JSON body
`{ _id, ...fields }` straight into `findByIdAndUpdate`, same
authenticated `Admin` session as Task 1's prior photo swap) — no DB
shortcut: set `noah_backcountry`'s `memberPoints` to `5` (a real value
chosen higher than `qa_tester_002`'s existing `3`, not an arbitrary
large number).

`GET /member/top-users` now returns `noah_backcountry` first,
`qa_tester_002` second. Live-checked `ActiveUsers.tsx`: renders both,
`noah_backcountry`'s real photo correctly filling the existing 140px
circular avatar treatment, first in order. No frontend code changes
needed — the component already handled an arbitrary-length array
correctly.

### Task 3: Full top-to-bottom visual pass

Screenshotted the entire homepage at 1920 and 390 (plus the individual
section crops at 1920/1440/390 used for Tasks 1-2) and reviewed every
section against the fixes above: Banner, Shop by Category, Best
Products, Highlights, Deals Of The Day, Product Details, Instagram,
Free Shipping, Active Users, Footer. Grepped `home.css` for any other
lingering `object-fit: contain` / faded-opacity "placeholder" patterns
beyond the ones already found — none remained; the one other
`object-fit: contain` (`.fs-icon`, Free Shipping's small SVG trust-badge
icons) is correct as-is, since icons should never be `cover`-cropped.
Confirmed zero browser console/page errors on load. No other visually
broken or unfinished elements found beyond what Tasks 1-2 already fixed.

### Files changed (frontend repo)

`src/css/home.css` (`.bp-card-media`, `.bp-add`, `.dd-card`,
`.dd-card-media` new, `.dd-add`, `.pd-thumb img`, `.pd-main-image`),
`src/app/screens/homePage/DealsOfTheDay.tsx` (added the missing image
markup + `serverApi` import).

No backend code changes — Task 2 used the existing real
`POST /admin/user/edit` endpoint as-is.

## Session — Homepage polish pass: card hover redesign, Active Users fixes, Product Details, final consistency sweep

Frontend-only session (no backend code changes). Batched per explicit
instruction: implemented and verified everything below before writing
this single combined entry and committing.

### 1. Best Products / Deals Of The Day: hover-reveal card redesign

Both sections' cards showed name+description+rating always visible in a
static block above the image — text-heavy at rest, inconsistent with an
image-forward product catalog. Redesigned to a shared hover-reveal
treatment:

- **Default**: image fills the card (unchanged sizing from the prior
  session's fix), only the product name is visible — fixed-height info
  header (`height: 80px`, `-webkit-line-clamp: 2`) so a 1- vs 2-line name
  can never change card height.
- **Hover**: description (+ rating, Best Products only) fades in as an
  absolutely-positioned overlay *inside* the image box — `position:
  absolute; inset: 0` inside `.bp-card-media`/`.dd-card-media`, so it
  occupies zero flex-flow space and can never push the card taller.
  `opacity 200ms ease-out` in, `250ms ease-in-out` out — reused verbatim
  from Best Products' pre-existing `box-shadow`/price-reveal timing
  rather than inventing a new curve. Deals Of The Day previously had no
  hover treatment at all on its card; unified to the same box-shadow
  lift + overlay pattern so both sections now share one consistent
  design instead of two.
- **Touch fallback**: the opacity-0 hidden-by-default state is scoped
  inside `@media (hover: hover)` — outside it (real touch devices) the
  overlay defaults to `opacity: 1`, so the description is never
  permanently unreachable off a pointer device. Verified on a real
  iPhone 13 Playwright emulation (`window.matchMedia("(hover: hover)")
  === false`) with no interaction: overlay opacity confirmed `1`.
  (Found and worked around a Playwright-specific artifact along the way:
  calling `.screenshot()` on an element internally triggers a CDP mouse
  move that flips the emulated `hover: hover` feature to `true` for the
  rest of that browser context — confirmed via isolated fresh-context
  tests that this doesn't reflect real touch-device behavior, just a
  test-harness quirk to route around with separate contexts.)
- **Scrim legibility, measured not assumed**: first tried a top-to-
  bottom gradient scrim (matching the visual weight of the hero/banner
  treatments); real pixel-sampling contrast measurement against all 4
  real product photos found it dropped to 2.3:1 near the top of the box
  (weak scrim + bright sky pixels) — a real risk for any future longer
  description wrapping higher into that zone. Switched to a flat
  `rgba(27,28,23,0.75)` scrim instead: measured 7.64–8.63:1 (WCAG AAA)
  uniformly across the *entire* overlay area on both sections, robust to
  text of any length/position, not just today's short descriptions.
- **Card-height parity, verified not eyeballed**: `getBoundingClientRect()`
  confirmed all 4 cards in each grid are identically 446px, both before
  and after hovering any card, at both 1920 and 1440.

### 2. Active Users: fallback avatar + row spacing

Two real bugs found live (screenshot showed `qa_tester_002` — no
`memberImage` — rendering as a jarring purple silhouette next to
`noah_backcountry`'s correctly-styled real photo):

- **Fallback icon color**: the shared `default-user.svg` (used across
  navbars, the user page, and orders page too) carries old generic
  Bootstrap-purple (`#a597fc`) fill/stroke colors — a leftover, not a
  CSS-treatment bug. The `.au-avatar` box itself (140×140, 50% radius,
  box-shadow, `background-size: cover`) was already applied identically
  to both the real-photo and fallback paths — confirmed via computed
  styles, not assumed. Rather than recolor the shared, multi-page SVG
  (out of scope, risks regressing already-shipped navbar/user-page
  appearance), added a new `public/icons/default-user-au.svg` — same
  glyph, recolored to `#aeb192` (sage) — and pointed only
  `ActiveUsers.tsx`'s fallback at it. Verified both avatars are now
  pixel-identical (140×140, same radius/shadow/`cover`) — only the
  `background-image` URL source differs, exactly as required.
- **Row gap**: `.au-row`'s `gap: 40px` was double every other card grid
  on the page (`bp-grid`/`dd-grid`/`sbc-row` all use `20px`) — clearly
  only ever visually checked with a single card (no gap to judge).
  `getTopUsers` confirmed capable of returning up to 4 real members
  (`memberPoints: { $gte: 1 }`, `limit: 4`, sorted desc). Tightened to
  `20px` to match the established rhythm; now reads as an intentional
  compact pair rather than a loose spread.

### 3. Product Details audit

- **Price wasn't actually missing** — `.pd-price` was present and
  `visibility: visible` in the DOM, just `font-size: 14px`/`font-weight:
  500`, identical to body copy and sitting directly under a 32px bold
  title, so it was easy to miss entirely at a glance (matches the "not
  visible at all" report). Bumped to `28px`/`600`. Tried the sage accent
  (`#aeb192`) first — measured only 2.21:1 against white, fails WCAG AA
  even at large-text size — kept the olive title color (`#707262`)
  instead, measured 4.92:1 (passes AA/AAA for large text).
- **Image fill**: `.pd-main-image` already correctly uses `100%`/`100%`/
  `object-fit: cover` from the prior session's image-sizing fix —
  re-verified live via computed style (`objectFit: "cover"`, filling its
  654×888px box exactly), not assumed correct just because it renders
  large.
- **Sort/data correctness**: `order=productPrice, sortDirection=DESC`
  confirmed still correct against the current real catalog — "3-Person
  Dome Tent" at $179 is genuinely the highest-priced of the 7 real
  products (cross-checked against the product table earlier in
  `COMPLETED_TASKS.md`), not stale data.

### 4. Final full top-to-bottom consistency sweep

Screenshotted every remaining section fresh (not just re-checking
already-flagged ones) at 1920 and 390: Banner, Shop by Category, Deals
Of The Day, Product Details, Instagram, Free Shipping, Active Users,
Footer. Found one real inconsistency: **Deals Of The Day's heading was
`font-size: 14px`/`font-weight: 500`** — body-text sized, reading as an
unfinished afterthought next to Shop by Category's `32px/600` and Best
Products' fluid `--vt-h1-size`/`700`. Matched to Shop by Category's
treatment (`32px`/`600`), the closest sibling in visual weight.
Everything else reviewed (Banner panels, Shop by Category cards,
Instagram grid, Free Shipping icons, Footer) was already consistent
with the rest of the rebuild — footer's wide gap between the brand/
subscribe block and the Shop/Help columns was left alone as an existing
intentional wide-layout convention, not a new regression.

### Verification

`npx tsc --noEmit` and `npm run build` clean after every change in this
session. Live Playwright screenshots at 1920 and 390 of the full
homepage top-to-bottom, plus targeted section crops and hover-state
captures throughout. Zero browser console/page errors on load
(`pageerror`/`console.error` listeners, confirmed empty). No frontend
regressions found in any section not explicitly touched this session.

## Session — Highlights missing product image + Products/ChosenProduct image-fill audit

### Highlights.tsx: real missing-image gap, confirmed against the actual reference theme

`Highlights.tsx`'s product card rendered name + description + "Add To
Cart" only — genuinely no `<img>`/background-image for the product photo
anywhere in the JSX or CSS, confirmed by reading the file directly
before changing anything (matches what was reported). Compared directly
against the real HikMali reference theme screenshots (not just the
earlier Figma data pull): the card should show the product's own photo
dominating the card, with a compact name/button footer below — the same
shape every other product card on the page already has.

Fixed by adding `hl-card-media` (real `product.productImages[0]` via
`serverApi`, same `/icons/noimage-list.svg` empty-array fallback used
everywhere else in the project) using the identical fixed-height +
`object-fit: cover` treatment as `bp-card-media`/`dd-card-media` from
the prior session — not the hover-reveal overlay those two grid
sections use, since Highlights is a single hero card (not a repeating
row) and the reference shows its caption always visible, not hidden
until hover. `hl-card-info`'s `padding-top` reduced from `60px` to
`20px` (was sized to vertically balance an image-less card) and
`hl-add` pinned via `margin-top: auto`, matching `bp-add`/`dd-add`'s
existing pattern. Card kept its fixed Figma-authored `390×554`
(desktop) / `480px`-min (mobile) size — unlike the grid sections, there
is no sibling row to keep height-uniform, so this stayed a fixed size
rather than becoming content-driven.

Verified live at 1920 and 390: real photo (`Alpine Ascent Climbing
Harness`) confirmed loading from `uploads/products/`, `object-fit:
cover` confirmed via computed style, card height unchanged, screenshots
compared directly against the reference layout — image now dominates,
name/desc/button read as a compact footer, matching proportion.

Systematic re-check for the same class of gap: grepped every homePage
component plus `ProductsPage`/`ChosenProduct` for `productImages`
usage — `BestProducts`, `DealsOfTheDay`, `ProductDetails` already
render real images (fixed in the prior session); `Highlights` is the
only one that was missing it entirely, now fixed.

### Products (Shop List) / ChosenProduct: narrow image-fill audit

Both `Products.tsx` and `ChosenProduct.tsx` were checked and confirmed
to be **entirely unmigrated Burak-era pages** — not a small styling gap.
Live computed-style check (not just a visual glance — the "Product
Detail" heading's `Dancing Script` font isn't actually loaded anywhere
in the project, so it silently falls back to a plain serif and briefly
looked deceptively "already redesigned" before checking
`getComputedStyle` directly) confirmed `#f8f8ff` backgrounds,
`Dancing Script`/`Roboto Serif` fonts, and the old gold/purple Burak
accent palette are still fully live on both pages. This is the same
scale of work as the ActiveUsers or Footer migrations, each its own
session — already flagged in full in `docs/ai/NEXT_STEPS.md`'s "Phase
2 — Products list" / "Phase 3 — Product detail" sections (full re-theme,
the Burak-branded "Our Family Brands" logos, the placeholder South
Korea map). Given the scale mismatch with a same-day pass, checked with
the user before proceeding rather than either silently doing a
multi-page redesign or silently under-delivering — confirmed: narrow
fix only, full migration stays deferred as already documented.

Within that narrow scope:
- `Products.tsx`'s list-card image (`.MuiCardMedia-root`) was already
  correct — `object-fit: cover !important`, confirmed via live computed
  style (273×275, no distortion). No fix needed.
- `ChosenProduct.tsx`'s main slider image (`.slider-image`) had **no
  `object-fit` at all** — the real bug. Default `object-fit: fill`
  visibly stretched the real product photo (1080×720 native) to match
  the swiper box's own ratio (601×480 at 1920px), distorting it.
  Confirmed via computed style before and after: `fill` → `cover`.
  Added `object-fit: cover` to `products.css`'s `.slider-image` rule,
  same treatment used everywhere else this session.
- No other missing-image gaps found on either page — both already
  render a real `<img>`/`CardMedia` bound to `productImages[0]` with
  the standard empty-fallback convention.

(`ordersPage/FinishedOrders.tsx`/`PausedOrders.tsx`/`ProcessOrders.tsx`
also reference `productImages` — outside this pass's named scope
(homePage + Products/ChosenProduct only), left untouched; noting for
visibility, not fixed.)

### Verification

`npx tsc --noEmit` and `npm run build` clean. Live Playwright screenshots
of Highlights (1920/390, before/after) and both Products pages
(list + detail, before/after the `object-fit` fix). Computed-style
checks throughout rather than trusting renders at a glance — this is
what caught the `Dancing Script` fallback-font false positive on
`ChosenProduct.tsx`.

## Session — Fix Highlights.tsx heading-clipping bug

Resolves the `.hl-heading` fixed-px-in-fluid-container item flagged in
`docs/ai/NEXT_STEPS.md` during the prior photo re-source session.
Checked whether `.hl-tick` and `.hl-cross` shared the same problem
rather than assuming only the heading was affected — they did, and one
turned out worse than the reported bug.

### What was actually wrong

- **`.hl-heading`**: fixed `top: 595px` inside `.highlights`
  (`aspect-ratio: 2.4`, fluid height = width ÷ 2.4) — clipped to a ~5px
  sliver at 1440 (600px-tall section), as already documented.
- **`.hl-cross` × 6**: same fixed-px `top` values in `Highlights.tsx`'s
  `CROSS_POSITIONS` array — one of them (`top: 708px`) clipped at both
  1536 and 1440.
- **`.hl-tick`**: a deeper, separate bug. The real Figma node is a
  112×12 box rotated 90° (`rotate-90`), not a naturally-tall 12×112 bar.
  The existing code approximated it as a plain vertical bar using
  `top: 708px` as the *final visual* top — but 708px is Figma's
  *pre-rotation* top-left corner; after a 90° rotation around the
  element's center, the true visual span is 658–770px. This meant
  `.hl-tick` overflowed `.highlights` by 20px even at the 1920 reference
  width, confirmed live (`708 + 112 = 820 > 800`) before touching
  anything — not something the fluid conversion introduced, a
  pre-existing miscalculation from the original build session.

### The fix

- `.hl-heading`, `.hl-tick`, and all 6 `CROSS_POSITIONS` `top` values
  converted to percentages of the 800px 1920-reference frame (e.g.
  `595px` → `74.375%`). No second real anchor exists to `clamp()`
  between — these elements are simply absent (not scaled) below the
  900px structural breakpoint — so a straight proportional scale is the
  correct conversion, not a two-point interpolation.
- `.hl-tick` rebuilt to replicate Figma's actual structure — the
  original 112×12 pre-rotation box (now fluid-positioned via the
  percentage above) plus `transform: rotate(90deg)` — instead of
  hand-approximating the rotated bounding box, which is what produced
  the wrong reference point in the first place.
- **A new interaction surfaced by making the heading fluid**: `.hl-card`
  is a fixed 390×554px block (deliberately held constant — no second
  Figma anchor for it either, same precedent applied everywhere in this
  rebuild). Once the heading could move, at 1536/1440 its new
  percentage-based position landed *inside* the card's fixed 0–554px
  footprint, hiding it behind the card's opaque background instead of
  clipping it — confirmed live before fixing (`bg rgb(245,245,245)`,
  the card's exact fill color). Fixed by giving `.highlights` a
  `min-height: 800px` floor — the section can never be shorter than the
  single Figma anchor at any desktop width, so the fixed-size card and
  the now-percentage-based heading/tick/crosses always reproduce the
  exact 1920 anchor's relationships, at every width down to the 900px
  structural breakpoint (where a separate mobile-specific rule resets
  `min-height: 0`).

### Verification

`npx tsc --noEmit` and `npm run build` clean. Live position checks
(`getBoundingClientRect`) at 1920/1536/1440/1440×719 confirmed zero
clipping and zero card overlap for the heading, tick, and all 6 crosses
— not just visually plausible, checked numerically. Contrast re-measured
with the same pixel-sampling script used throughout this rebuild:

| Width | Contrast | Result |
|---|---|---|
| 1920 | 4.36:1 | AA (large text) |
| 1536 | 5.00:1 | AA |
| 1440 | 4.68:1 | AA — genuinely measurable now, not just "no longer clipped" |
| 1440×719 (real measured window) | 4.68:1 | AA |
| 390 | n/a | heading/tick/crosses confirmed `display: none`, matching the mobile frame |

Full-page screenshot at 1440 confirmed no layout regression elsewhere
on the page from the section's height now locking to 800px at that
width (previously 600px) — surrounding sections unaffected.

## Session — Shop List/Shop Detail rebuild, Session 1: shared Breadcrumb component

First scoped session of the approved Shop List/Shop Detail Figma gap-
analysis build order (see the plan discussion — Products.tsx/
ChosenProduct.tsx are the last two major unmigrated pages). Scoped
strictly to the breadcrumb band only, per the session plan — nothing
else in either file touched.

### What was built

`src/app/components/breadcrumb/index.tsx` — a shared `Breadcrumb`
component (`heading: string`, `trail: { label: string; to?: string }[]`
props) matching the identical `#d9dbc5` band / 48px bold heading /
"Home | X" trail structure both the real Shop List (Figma `2458:2`) and
Shop Detail (`2461:881`) frames use. Plain `className` + a dedicated
`src/css/breadcrumb.css` file, no styled-components (the `divider`
component is the only remaining styled-components consumer in the
codebase — out of scope here, not touched).

Real-route-over-decorative-mockup discipline, same precedent as
`OtherNavbar`'s earlier rebuild: Figma's trail is a plain, non-
interactive string ("Home     |    Shop"); "Home" renders as a real
`react-router` `Link` to `/`, the current page renders as plain text,
not a dead link.

Layout uses normal document flow (trail above heading, inside the
standard `--vt-gutter`/`--vt-content-max` container every other section
already uses) rather than copying Figma's raw absolute coordinates —
those don't translate correctly to plain CSS as-is (Figma's text-box
trim metrics make the heading/trail's raw y-coordinates 7.5px apart
despite rendering with a large visual gap in the actual screenshot;
every prior section in this rebuild took the same flow-layout approach
for the same reason).

Heading size: flat `48px` (matches Figma's literal 1920 value), stepping
to `32px` below the 900px structural breakpoint — noted in the CSS as a
conservative, *unverified* fluid step-down, since no mobile Shop List/
Shop Detail frame was pulled in this session (scoped to the breadcrumb
only); worth confirming against the real mobile frame whenever those
pages get their own dedicated mobile pass.

### Wired in

- `Products.tsx`: `<Breadcrumb heading="Shop" trail={[Home→"/", "Shop"]} />`
  inserted as the first child, above all existing content.
- `ChosenProduct.tsx`: same pattern, `heading="Shop Detail"`. The
  existing `<Box className="title">Product Detail</Box>` inline heading
  was deliberately left in place (not removed/deduplicated) — that's
  explicitly Session 4's scope (Shop Detail gallery/info panel
  restyle), and this session's instruction was "don't touch anything
  else in either file yet." Both headings render for now
  ("Shop Detail" in the new band, "Product Detail" below it,
  unchanged) — a known, deliberate, temporary duplication.

### Verification

`npx tsc --noEmit` and `npm run build` clean. Live Playwright screenshots
at 1920/1440/390 on both `/products` and `/products/:id` confirmed the
band, trail text, and heading all render correctly with real data at
every width; "Home" link confirmed as a real `react-router` route, not
decorative.

## Session — Shop List/Shop Detail rebuild, Session 2: grid + card redesign

Second scoped session of the approved Shop List/Shop Detail build order.
Scoped to the grid, card, and category filter only — sort controls,
results count, and pagination (Session 3) deliberately untouched.

### Category filter — real design decision, resolved with the user first

Figma's Shop List frame (`2458:2`) shows only a compact, collapsed
"Filter" control with no expanded state visible in the static frame —
genuinely unknowable what widget it opens into. Rather than guess,
proposed 3 real options (horizontal chip row / dropdown panel / compact
drawer) via `AskUserQuestion`; user picked the horizontal chip row.
Replaced the old 8-button rotated `-90deg` sidebar (`.category-tabs`)
with `.sl-filter-row` — the same real `ProductCollection` values
(`CATEGORY_FILTERS` array), same `searchCollectionHandler` wiring,
just a compact pill-row widget instead of a vertical rotated rail.

### Grid + card — reused bp-card verbatim, not a new pattern

`.sl-card` is structurally identical to `bp-card` (home.css, from the
homepage rebuild): fixed-height `80px` name header
(`-webkit-line-clamp: 2`, so a 1- vs 2-line name can't change card
height), fixed `320px` `object-fit: cover` media, an absolutely-
positioned hover-reveal overlay for desc/rating (opacity 200ms ease-out
in / 250ms ease-in-out out — same timing reused verbatim, not
reinvented), and an "Add To Cart" bar pinned via `margin-top: auto`
with the price hover-revealed inside it
(`max-width`/`opacity` transition, identical to `bp-add-price`).
Same measured flat scrim (`rgba(27,28,23,0.75)`, previously verified
>=7:1 WCAG AAA against the brightest real product photo) — not
re-measured against different photos in this pass since it's the same
scrim already proven against the same real catalog images. Same touch
fallback: overlay defaults to visible outside `@media (hover: hover)`.

Figma's card also shows "Model : ... " + 4 color swatches + a delivery-
day estimate on hover — no backend field for any of the three (no
model/variant field, no color-swatch data, no delivery-estimate field
on `Product`), the same class of gap already resolved for Best
Products/Highlights/Product Details. Dropped, per that same precedent —
only real fields render: name, description (when present), rating
(when `reviewCount > 0`), and price. The old card's cart-icon-button +
real `productViews` eye-badge hover treatment was also replaced by the
bp-card pattern rather than kept alongside it — the task's explicit
brief was to reuse bp-card's convention "verbatim, don't invent a new
pattern," and bp-card doesn't carry a views badge; dropping it keeps
this card consistent with every other product-grid card on the site
rather than becoming a third, one-off treatment. The always-visible
orange "NORMAL size" `Chip` badge was dropped for the same
consistency-over-one-off reason (bp-card has no size badge either;
Figma's Shop List card doesn't show one).

### Real bug found and fixed: grid container too narrow for 390px cards

`.sl-grid` initially used `grid-template-columns: repeat(4, minmax(0,
1fr))` (same as `bp-grid`) — but Best Products' homepage row lives
inside the site's own `--vt-content-max: 1920px` container, while Shop
List still uses a legacy MUI `<Container>` capped around ~1200-1280px.
`minmax(0, 1fr)` squeezed cards to a measured 298px instead of 390px.
Switched to fixed `390px` tracks (`repeat(auto-fill, 390px)`,
`justify-content: center`) so cards are always the real Figma size
regardless of how many fit per row — confirmed via live measurement,
390px exactly. Only 3 columns fit at the current container width
instead of Figma's 4; flagged as a new `NEXT_STEPS.md` item rather than
widening the shared `<Container>` (would reflow the title/search/sort
row this session wasn't touching).

### Verification

`npx tsc --noEmit` and `npm run build` clean (bundle actually shrank —
several MUI component imports, `Card`/`CardMedia`/`Chip`, are no longer
used). Live Playwright checks at 1920/1440/390: card measured exactly
390px wide, `446px` tall (matches `bp-card`'s exact fixed-sum height),
hover confirmed revealing the overlay and `"Add To Cart | $89"` price
text, filter chips confirmed switching `productSearch.productCollection`
and re-fetching (verified the real empty state — "Other" has 0 real
products — renders correctly too). Confirmed a pre-existing horizontal
overflow at 390px width is **not** caused by anything built this
session — traced to the untouched `title-container`
(`margin-left: 450px`), fixed-width search box, "Our Family Brands", and
the address `<iframe>`, all already-flagged legacy Burak content outside
this session's scope. Every collection in the real catalog currently
holds exactly 1 product, so true multi-card-per-row wrapping wasn't
visible live — the grid math itself (fixed 390px tracks, 20px gap) is
deterministic CSS, confirmed correct without needing more catalog data
to prove it.

## Session — Shop List/Shop Detail rebuild, Sessions 3-5: sort/pagination, Shop Detail restyle, restaurant→product rename

Combined pass per the user's explicit request — all three are restyle/
rename work reusing already-proven patterns, no new design decisions.
Each sub-session verified independently at 1920/1440/390 before moving
to the next; single combined commit.

### Session 3 — Shop List sort + results count + pagination

Sort control (`NEW`/`PRICE`/`VIEWS`) restyled onto the exact
`.sl-filter-chip` pill treatment from Session 2's category filter — same
real button/pill convention, not new styling (relabeled `Newest`/
`Price`/`Most Viewed` for clarity, same `searchOrderHandler` wiring
underneath). Moved into a new `.sl-results-row` alongside the results
count, above the category chips.

Results count ships honestly: `{products.length} Result(s)` — the real
returned array length, correctly pluralized — not Figma's fabricated
"Showing 1-15 of 50 Results" (the `50` has no backend equivalent; `GET
/product/all` has no total-count field, already documented in
`NEXT_STEPS.md`).

`MuiPaginationItem` restyled to the site palette (`#707262` selected
state, `#e5e3d3` hover) via scoped CSS overrides — no change to the
existing page-count-estimation logic (`products.length === limit ?
page + 1 : page`, already correct, untouched — that's the same honesty
constraint already applied, not new to this session).

### Session 4 — Shop Detail gallery + info panel restyle

`ChosenProduct.tsx`'s looping `Swiper` carousel replaced with the real
Figma (`2461:881`) rail + large-image split — reused `ProductDetails.tsx`'s
(homepage) already-solved `pd-*` pattern verbatim under an `sd-*` prefix:
same `activeImage` state shape, same fixed `116x116` thumbnail rail,
same `aspect-ratio: 663/900` main image, same `object-fit: cover`
throughout (still the real `productImages` array — no data change).

Price/size-row typography matches `pd-price`/`pd-size-row` exactly
(`28px`/`600` price, contrast-checked color already proven there; size
shown as `ProductSize`'s real single value in an inert label, not a
fake S/M/L/XL picker — same precedent, reused not reinvented).

Added the second "Buy Now" button, wiring in `buyNowHandler`
(`addToCartHandler` then `history.push("/checkout")`) — literally the
same shape as `ProductDetails.tsx`'s existing handler, not a new one.

Removed the old duplicate `<Box className="title">Product Detail</Box>`
— Breadcrumb (Session 1) already renders the real "Shop Detail" heading;
this resolves the known, deliberately-temporary duplication flagged in
Session 1's notes.

`averageRating`/`productViews` (real, already-wired data with no
counterpart in the reused `pd-*` pattern) were kept and restyled into a
new `.sd-meta-row` rather than dropped — genuine product data, not
mockup filler, so the "reuse verbatim" instruction didn't extend to
removing real functioning features the pattern itself simply never had
to handle.

### Session 5 — restaurant→product renaming + content decision

**Content decision, not just a rename**: `ChosenProduct.tsx` was
showing the **admin member's** nickname and phone number in a slot
Figma's Shop Detail frame has no equivalent for — a real content bug,
not a styling one, first flagged when this was originally built.
Confirmed there's no seller/vendor concept anywhere in this
single-tenant store (one admin, not a marketplace), so there's no real
content that could replace it. Dropped the block entirely rather than
keep surfacing internal admin contact details to customers.

Mechanical rename followed from removing the only real consumer of the
`restaurant` naming: `retrieveRestaurant` (`selector.ts`), `setRestaurant`
+ the `restaurant` field on `ProductPageState` (`slice.ts`, and its type
in `lib/types/screen.ts`) all removed — not just renamed, since nothing
in `ChosenProduct.tsx`/`Products.tsx` needs any representation of "who
sells this" once the admin-info block itself is gone. `Products.tsx`'s
long-dead `setRestaurant`/`setChosenProduct` imports (flagged as unused
in a much earlier ESLint pass, `NEXT_STEPS.md`) are also gone as a
result.

Two now-orphaned pieces flagged in `NEXT_STEPS.md` rather than touched
in this pass (outside these sessions' explicit file scope):
`MemberService.getRestaurant()` (`services/MemberService.ts`, no longer
called anywhere) and the `swiper`/`swiper/react` npm dependency
(`ChosenProduct.tsx` was its only real consumer).

### Verification

`npx tsc --noEmit` and `npm run build` clean throughout (final bundle:
-25kB gzipped JS, -3kB gzipped CSS, from the Swiper removal and dead
MUI imports). Live Playwright checks at 1920/1440/390 for each
sub-session: Session 3's results count/sort/pagination confirmed with
real data; Session 4/5's combined Shop Detail state confirmed
programmatically (`breadcrumbHeading: "Shop Detail"`,
`duplicateTitleExists: false`, `restaurantBlockExists: false`, real
`sdTitle`/`sdPrice`/`sdSizeValue`/thumbnail count/main image src all
present) at every width, screenshots visually confirmed the mobile
stacked layout (image on top, thumbnail row below) matches the reused
`pd-*` breakpoint behavior. Zero browser console/page errors on either
page.

### Session 6 — Shop Detail lifestyle banner

Built the bottom Shop Detail lifestyle/banner section in
`venturo-react/src/app/screens/productsPage/ChosenProduct.tsx` and
`venturo-react/src/css/products.css`. The reference is the real HikMali
Shop Detail frame `2461:881` (1920 x 3584), Banner node `7:247`; its
background placeholder is node `2462:1551` (`AdobeStock_590451543`).
At the 1920px anchor, the new media area is 1620 x 481px inside the
shared 150px gutter, with the heading at the verified 428px inset from
the image left edge (578px from page left), 162px from the image top.
It retains only the Figma's generic, truthful `Best Enjoyed Outside`
copy and white `Shop Now` CTA. The CTA is a real React Router link to
`/products`; no product, discount, seller, review, stock, or other
template-only data was added. Client Reviews remains Session 7 scope.

The source Figma placeholder carries no usable photographic asset.
`public/img/shop-detail-banner.jpg` was present as an untracked
2400 x 1600 JPEG with no embedded metadata or local provenance record,
so it was not trusted or committed as-is. It was replaced at the same
path with the Unsplash Search API `regular` download (1080 x 720) for
[Alex Moliski, "Hiker walks through dry grass towards mountains"]
(https://unsplash.com/photos/hiker-walks-through-dry-grass-towards-mountains-J9FkFuJFUgM),
photo ID `J9FkFuJFUgM`, selected after previewing multiple real hiking
candidates for its muted golden documentary treatment, right-aligned
hiker, and open left-side copy zone. The required
`links.download_location` request returned HTTP 200 before download.
License: Unsplash License; attribution is recorded here as good practice.

No dedicated Shop Detail mobile frame exists in the source Figma;
mobile behavior was adapted using HikMali mobile homepage Banner node
`7:147` as responsive precedent and Venturo's established responsive
system. The banner uses the existing fluid gutter/content tokens and one
structural breakpoint at 900px: desktop retains the Figma aspect ratio;
mobile becomes a 507px-tall, near-full-width photographic composition
at 390px, with 44px heading type, 24px image inset for copy, and a
66%-positioned crop that retains the hiker to the right.

Contrast was measured from the actual final JPEG by CSS `cover` crop
and pixel sampling, compositing the final limited left-side scrim
(`rgb(20,21,17)` gradient) before applying WCAG relative luminance.
Heading-area minimum contrast: 9.83:1 at 1920, 7.83:1 at 1536, 6.95:1
at 1440, and 5.93:1 at 390; all clear the 4.5:1 AA threshold. The CTA
uses a white fill; `#707262` text measures 4.92:1 against it. Responsive
geometry was also checked mathematically at 1920 (1620 x 481 media),
1536 (1301.25 x 384.80), 1440 (1221.57 x 360.75), and 390 (350 x 507).
The section has no viewport-height rule, so the approximately 719px
tall viewport affects only normal page scroll, not banner crop/height.
A controllable browser surface was unavailable in this execution
environment, so no live DOM/screenshot inspection could be performed;
the static crop/geometry measurements are recorded explicitly rather
than represented as browser results.

Verification: `npx tsc --noEmit` passed and `npm run build` passed.
The build retains only the repository's pre-existing ESLint warnings;
this session introduced none. Files changed:
`ChosenProduct.tsx`, `products.css`, and
`public/img/shop-detail-banner.jpg`.

### Shop List — HikMali node 2458:2

Rebuilt `/products` in `venturo-react/src/app/screens/productsPage/Products.tsx`
and `venturo-react/src/css/products.css` against the HikMali Shop List desktop
frame `2458:2`: existing global header, Breadcrumb `Home | Shop` / `Shop`,
toolbar, grid, honest pagination, the existing `FreeShipping` strip, and the
global footer. The default query no longer forces `CLIMBING`; it requests all
real PROCESS products, while valid `productCollection` deep links still apply.

Cards map only real backend `productCollection`, `productName`, primary
`productImages[0]`, `productPrice`, and `productLeftCount` behavior. Figma-only
discounts, model names, colour variants, delivery claims, stock messages, and
ratings/review counts were deliberately omitted. Real name search, collection
filtering, and the supported createdAt/price/views/averageRating sort mappings
remain functional. Pagination uses only previous/current/next because the API
does not return a total count; it preserves the current filter/search/sort
state. Cart additions reuse the existing basket flow; unavailable products are
disabled from `productLeftCount` without exposing a numeric stock level.

Live browser checks found no horizontal overflow at 1920, 1536, 1440, 900, or
390px. At 1920, the content area measured 1620px with four 390 x 554px cards
and 20px gaps; layouts reduced to three desktop columns at 1536/1440 and one
column at 900/390. Live checks confirmed the unfiltered all-products response,
HIKING deep link, real name search, sorting, product-detail navigation, and
Add To Cart. The present catalogue has seven products, so Next pagination and
an out-of-stock card were not available for live activation; both paths were
verified from their state-preserving and `productLeftCount <= 0` implementation.
`npx tsc --noEmit` and `npm run build` passed; build warnings are pre-existing.

### Shop List — shared card finalization

Finalized the approved shared `BestProductCard` extraction: Homepage Best
Products and Shop List now render one component with the same 80px title area,
320px media area, 45px CTA, dark description overlay, real primary product
image, price reveal, and stock-safe Add To Cart state. The Shop List keeps its
HikMali node `2458:2` page shell and four-column, 20px-gap desktop grid, but
now inherits the natural approximately 445px Homepage card height rather than
the prior stretched 554px variant. Live checks confirmed the matching geometry,
product navigation, category deep link, submitted name search, and no desktop
overflow; its current seven-product dataset leaves Next disabled. `npx tsc
--noEmit` and `npm run build` passed with only existing warnings.

### Contact page — HikMali node 2465:1643

Implemented `/contact` from the desktop Contact Us frame `2465:1643` using the
shared breadcrumb, FreeShipping strip, and footer. No Contact mobile frame
exists. The real public `POST /contact/submit` endpoint and existing
`ContactService` are used with required name, email, backend-required subject,
message, agreement validation, disabled sending state, and success/error UI.
The Figma mobile number, address, phone, email, hours, map, and demo image were
not fabricated: subject replaces mobile number, generic truthful contact copy
is shown, location is explicitly unavailable, and the existing Venturo badge
replaces the licensed demo asset. Live checks at 1920, 1536, 1440, 900, and 390
confirmed responsive stacking, fields, footer, and no horizontal overflow.
`npx tsc --noEmit` and `npm run build` passed with existing warnings only.

### FAQ page — HikMali node 2465:2353

Implemented `/faq` from Figma FAQ frame `2465:2353`; no dedicated full mobile
FAQ frame exists. The backend has no FAQ API, so `faq.ts` now contains the
approved static Venturo-safe content in Shopping and Account/Order Support
groups. Built two accessible single-open accordion groups, the Figma-width
desktop help panel, shared Breadcrumb, benefits strip, and footer FAQ link.
Verified 1920, 1536, 1440, 900, and 390px: desktop retains two columns,
tablet/mobile stacks with no horizontal overflow. `npx tsc --noEmit`, `npm run
build`, and `git diff --check` passed; only existing lint warnings remain.

## Session — Make the Article feature genuinely usable end-to-end

Goal: unblock the planned frontend Blog List/Blog Detail pages (real
Figma frames already identified: node 2465:2715 and 2470:109) the same
way creating 7 real products unblocked the homepage's product sections.
Confirmed every Article endpoint's real current behavior by reading the
actual controller/service/router code first, then verified live against
the real dev database — not assumed from the original design intent.

### Real current state, confirmed

- `GET /article/all` (public): returns every `PUBLISHED` article,
  sorted `createdAt` desc. **No pagination and no category filtering
  at all** — confirmed live, not just from reading
  `ArticleService.getArticles()`: with 6 real published articles in the
  database, `?page=1&limit=2` still returned all 6, and
  `?category=NEWS` still returned all 6 across every category
  unfiltered. This is a bigger gap than `GET /product/all`'s
  already-documented "no total-count field" limitation — `GET
  /product/all` at least has real `$skip`/`$limit`/category-match
  aggregation; `GET /article/all` has none of that machinery at all,
  no `ArticleInquiry` type even exists. Flagged in `NEXT_STEPS.md`
  rather than silently assuming the frontend Blog List can work around
  it — it can't, yet.
- `GET /article/:slug` (public): works correctly, `PUBLISHED`-only,
  confirmed 404 on both a nonexistent slug and a real slug flipped
  back to `DRAFT` (tested live: toggled a real published article to
  `DRAFT` via the real admin endpoint, confirmed it both disappeared
  from `GET /article/all`'s count and 404'd on its own slug URL, then
  restored it to `PUBLISHED` and confirmed both reversed).
- Admin `GET/POST /article/*` (`verifyRestaurant`-guarded, matching
  the product admin routes' auth exactly): all three (list, create,
  update) were real and functional, but `getAllArticlesAdmin` was
  JSON-only with **no EJS view at all** — genuinely no way for the
  site admin to write or manage articles without hitting the raw API
  directly, exactly as described.

### Built: minimal EJS admin view, same pattern as products.ejs

- `articleController.getAllArticlesAdmin` now renders a new
  `src/views/articles.ejs` (list table + create form) instead of
  returning JSON — same `res.render(view, { data })` pattern as
  `productController.getAllProducts`, same `/css/products.css` reused
  as-is (its classes are all generic/structural, not product-specific).
- `articleController.createNewArticle`'s response changed from JSON to
  the same inline-script alert+redirect pattern as
  `createNewProduct` (`res.send('<script>...window.location.replace...
  </script>')`) — required for a plain, non-AJAX `<form method="POST">`
  submit to work the same way the product create form does.
- `articleController.updateChosenArticle`'s response wrapped in `{
  data: result }` to match `updateChosenProduct`'s exact shape — the
  new `public/js/articles.js` AJAX status-change handler checks
  `result.data`, identical to `products.js`'s existing check.
- `public/js/articles.js`: mirrors `products.js`'s `#process-btn`/
  `#cancel-btn` form-toggle and AJAX status-update handler exactly,
  plus one small addition — an `autoSlugHandler()` that fills the slug
  field from the title as the admin types (stops once the admin
  manually edits the slug field, tracked via a `data("touched")` flag)
  since `Article.slug` is a real unique-indexed field with no
  auto-generation anywhere before this.
- Added a real "Articles" nav link (`/admin/article/all`) to
  `home.ejs`, `products.ejs`, and `users.ejs`'s existing nav bars —
  the view otherwise would have been unreachable without knowing the
  URL by heart, undermining "genuinely usable end-to-end".

### 5 real articles created through the admin view — not a DB insert

Real, honest outdoor-gear content, no Lorem Ipsum, one per topic — all
created by literally driving the real HTML form (Playwright filling
and submitting the actual page, same as a human admin would), then
published through the real per-row status dropdown (same
`PAUSE→PROCESS`-style publish workflow already established for
products, `DRAFT→PUBLISHED` here):

| Title | Category | Slug |
|---|---|---|
| How to Choose the Right Sleeping Bag Temperature Rating | GEAR_GUIDES | `sleeping-bag-temperature-rating-guide` |
| Trip Report: Three Days on the Wonderland Trail | TRIP_REPORTS | `wonderland-trail-three-day-trip-report` |
| Venturo Adds Free Returns on All Footwear | NEWS | `free-returns-on-all-footwear` |
| Five Ways to Waterproof Your Hiking Boots | TIPS | `waterproof-hiking-boots-five-ways` |
| Layering for Cold-Weather Backpacking: A Practical Guide | GEAR_GUIDES | `cold-weather-backpacking-layering-guide` |

All 4 real `ArticleCategory` values now have at least one real article
(2x `GEAR_GUIDES`, 1x each of `TRIP_REPORTS`/`NEWS`/`TIPS`), plus the
pre-existing `qa-test-article` (`GEAR_GUIDES`) — 6 real published
articles total, confirmed live via `GET /article/all`.

### Verification

`npx tsc --noEmit` clean. Live requests against the real dev database
throughout (not just code-reading): admin login → real list page render
→ real form submission → real per-row publish toggle → public endpoint
confirms all 6, each real slug fetch confirms the right content/
category/status. Screenshots of the real rendered admin list (before
and after creating the 5 articles) and the open create form captured.
Backend dev server restarted under `nodemon` (was running as a bare
`ts-node` process with no auto-reload) so the controller changes were
actually live for this verification, not stale.

## Session — Article feature re-verification + FAQ-stub for a broken concurrent build

**Type**: Re-verification of the already-committed Article admin work
(`edb891c`) plus one small, explicitly out-of-scope unblock. No new
Article functionality was built — that work was already complete and
committed by the time this session started.

### What was found

- The Article admin UI, controllers, and views described in the prior
  session's entry above were already fully built and committed
  (`edb891c feat: make Article feature usable end-to-end with a real
  admin UI`). This session's own independent build of the same feature
  (controller changes, `articles.ejs`, `articles.js`, nav links)
  matched byte-for-byte or was superseded by what was already committed
  — confirmed via `git diff`, nothing further was needed there.
- **A real, unrelated problem found along the way**: every file in
  `src/public/js/` (`home.js`, `main.js`, `products.js`, `signup.js`,
  `users.js`, `articles.js`) was deleted on disk while still present in
  the last commit — not caused by this session's own edits, and not
  explained by any corresponding code change. Flagged to the user and
  restored via `git checkout -- src/public/js/` per their explicit
  choice, rather than silently fixed or silently left broken.
- **A second, separate problem**: `src/router.ts`/`src/router-admin.ts`
  had been modified (outside this session, alongside a new
  `package.json` `seed:faqs` script) to import
  `./controllers/faq.controller`, a file that does not exist —
  breaking `npx tsc --noEmit` and crashing the dev server for the whole
  repo, not just this task. This is an in-progress FAQ feature started
  by a different, concurrent session — not part of this task's scope.

### The stub, and its explicit boundary

Per the user's explicit direction, added `src/controllers/faq.controller.ts`
as a minimal stub — `getFAQs`/`getAllFAQs`/`createFAQ`/`updateFAQ`/
`deleteFAQ`, each just returning `501 Not Implemented` — solely to
restore `tsc`/the dev server to a working state so the Article
verification below could run. The file is explicitly commented as a
temporary stub for whoever is building the real FAQ feature to replace;
no FAQ schema, service, type, or enum was created, and no real FAQ
logic was written. This is intentionally out of scope for the Article
task and was not extended beyond unblocking the build.

### Live re-verification of the Article feature (post-unblock)

With the real ADMIN session (`memberNick: Admin`), re-confirmed the
entire flow fresh against the running server rather than trusting the
prior session's already-documented results alone:

- `GET /admin/article/all` (authenticated): renders the real `articles.ejs`
  list — all 6 real articles (5 real + `qa-test-article`), correct
  titles/slugs/categories, plus the "New Article" create form present
  in the markup.
- `GET /article/all` (public): returns all 6 real articles with full
  content.
- **Confirmed, live, again**: `?page=1&limit=2` and `?category=NEWS`
  both still return all 6 — no pagination, no category filtering. Same
  gap already documented in the prior session's entry and in
  `NEXT_STEPS.md`; re-confirmed rather than assumed still true.
- `GET /article/:slug` for a real slug → `200`; for a nonexistent slug
  → `404`.
- Full status-toggle round trip via the real AJAX endpoint
  (`POST /admin/article/:id`, matching `products.js`'s pattern):
  toggled `qa-test-article` to `DRAFT` → public list count `6 → 5`,
  direct slug fetch `→ 404`; toggled back to `PUBLISHED` → count
  restored to `6`, confirming the DRAFT/PUBLISHED gate genuinely works
  both ways, not just create-time.

**Validation**: `npx tsc --noEmit` — zero errors, both before and after
adding the FAQ stub. `git status` confirmed the only changes are the
restored `src/public/js/*` files (now matching HEAD, i.e. no diff), the
pre-existing uncommitted `router.ts`/`router-admin.ts`/`package.json`
FAQ-wiring changes from the concurrent session (left as-is, not
authored here), and the new `faq.controller.ts` stub.

## Session — FAQ Backend Module

Implemented the real MongoDB-backed FAQ module and replaced the temporary
`501` controller stub. `FAQ` documents contain `faqQuestion`, `faqAnswer`,
`faqGroup` (`SHOPPING` or `ACCOUNT_SUPPORT`), `faqStatus` (`ACTIVE` or
`HIDDEN`, default `ACTIVE`), `faqOrder`, and timestamps. The public
`GET /faq/all` endpoint returns only active entries, projects only the
frontend fields (`_id`, question, answer, group, order), and explicitly sorts
Shopping before Account Support, then by ascending order.

Admin JSON CRUD is available at `GET /admin/faq/all`, `POST /admin/faq/create`,
`POST /admin/faq/:id`, and `POST /admin/faq/:id/delete`. Every route reuses
`restaurantController.verifyRestaurant`; create/update validate trimmed required
question and answer, enum group/status values, and non-negative integer order.
No FAQ EJS management UI was added, matching the existing JSON-only Contact
admin pattern.

Added the idempotent `npm run seed:faqs` command. It upserts the ten approved
records by `{ faqGroup, faqQuestion }`, sets their approved content/order and
`ACTIVE` status, and requires `FAQ_SEED_CONFIRM=true` before it calls
`mongoose.connect`. The seed was not executed because `.env` points to a remote
MongoDB database; the guard was confirmed to stop before connecting or writing.

Validation: `npx tsc --noEmit` passed, `npm run build` passed, schema validation
covered valid and invalid FAQ documents without a database connection, and
`git diff --check` passed. Compiler-generated untracked files from `npm run build`
were removed without touching tracked browser JavaScript files.
