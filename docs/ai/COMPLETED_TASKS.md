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
