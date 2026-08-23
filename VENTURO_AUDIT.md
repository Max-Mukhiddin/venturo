# Venturo Codebase Audit

Scope: everything in this repository as of the single commit `7b1e0a9 feat: initial setup venturo` on branch `develop`. There is only one commit in git history, so no diff/blame trail exists to show what changed during the "Burak → Venturo" migration — every claim below is inferred purely from the current file contents, not from history.

---

## 1. Structure First

### 1.1 Folder layout

This is **not** a split frontend/backend repo. It is a single Node.js/TypeScript backend project that also serves a small server-rendered (EJS) admin panel. There is no `client/`, `frontend/`, `web/`, or React/Vue/Angular project anywhere in the repository.

```
venturo/
├── package.json / package-lock.json     (single package, one workspace)
├── tsconfig.json
├── .env                                  (PORT, MONGO_URL, SESSION_SECRET, SECRET_TOKEN)
├── .vscode/ (tasks.json, mcp.json)
└── src/
    ├── app.ts                            Express app wiring (sessions, view engine, routers)
    ├── server.ts                         Entry point: connects Mongoose, starts HTTP listener
    ├── train.ts                          Scratch file of unrelated algorithm exercises (see 4.6)
    ├── router.ts                         "Public/SPA" JSON REST API mounted at "/"
    ├── router-admin.ts                   Server-rendered admin panel mounted at "/admin"
    ├── controllers/                      member, product, order, restaurant controllers
    ├── models/                           *.service.ts — business logic layer (Mongoose calls)
    ├── schema/                           Mongoose schemas (Member, Product, Order, OrderItem, View)
    ├── libs/
    │   ├── config.ts, Errors.ts
    │   ├── enums/                        member, order, product, view enums
    │   ├── types/                        member, order, product, view, common TS interfaces
    │   └── utils/uploader.ts             multer disk storage factory
    ├── views/                            EJS templates for the admin panel only
    │   ├── home.ejs, login.ejs, signup.ejs, products.ejs, users.ejs
    │   └── includes/header.ejs, footer.ejs
    └── public/                           static assets for the EJS admin panel (css/js/img)
```

### 1.2 Real tech stack (from config files, not guesses)

| Concern | What's actually used | Evidence |
|---|---|---|
| Language | TypeScript (strict mode) | `tsconfig.json` |
| Framework | Express 4 | `package.json` deps, `src/app.ts` |
| Database | MongoDB | `mongoose` v6.2.9, `mongodb` v3.2.6 driver, `MONGO_URL` in `.env` |
| ORM/ODM | Mongoose (schema-first) | `src/schema/*.model.ts` |
| API style | REST (JSON), **not** GraphQL | `router.ts` returns `res.json(...)`; no `graphql`/`apollo` packages anywhere in `package.json` or source |
| Auth | Two parallel mechanisms: JWT via `jsonwebtoken` (cookie `accessToken`) for the `/` REST API, and `express-session` (backed by `connect-mongodb-session`, MongoDB-persisted) for the `/admin` panel | `src/models/Auth.service.ts`, `src/app.ts` session block, `restaurantController.verifyRestaurant` |
| Password hashing | bcryptjs | `MemberService.signup`/`login` |
| UI library (admin only) | None (no React/Vue/Angular). Server-rendered EJS + Bootstrap 4 (via CDN) + jQuery 3 (via CDN, two versions loaded) + anime.js (CDN, home page only) | `views/includes/header.ejs` |
| Templating | EJS 3.1.6 | `package.json`, `app.set("view engine", "ejs")` |
| State management | None (no client-side framework state; admin panel uses plain jQuery + axios AJAX calls) | `src/public/js/*.js` |
| Styling | Hand-written CSS per page (`home.css`, `login.css`, `products.css`, `signup.css`, `users.css`, `main.css`) + Bootstrap 4 | `src/public/css/` |
| File uploads | multer, disk storage under `./uploads/<address>` | `src/libs/utils/uploader.ts` |
| Logging | morgan | `src/app.ts` |

**Important structural note:** `src/app.ts` line 55 has the comment `app.use("/", router); // SPA: REACT`, implying `router.ts` (the JSON REST API for members/products/orders) is meant to be consumed by a separate React single-page app. **No such React app exists anywhere in this repository.** Either it was never committed here, lives in a separate repo, or was planned but never built. This is flagged as an open question in Section "Open Questions."

---

## 2. Find What Was Renamed

### 2.1 "burak" (case-insensitive) — leftover template naming

Exactly **one** file still contains the string "Burak":

- `src/views/includes/header.ejs:4` — `<title>Burak</title>`

This is the `<title>` tag shared by every EJS page (home, login, signup, products, users) via `include('includes/header')`, since none of those pages override the title. So **every page in the admin panel currently displays "Burak" as the browser tab title** — this is the one clearly incomplete piece of the rename.

No other file (TypeScript, JSON, CSS, JS, or any config) contains "burak" in any casing.

### 2.2 "venturo" — confirmed-changed areas

Only **two** files contain "venturo":

- `package.json` — `"name": "venturo"`
- `package-lock.json` — `"name": "venturo"` (root + lockfile metadata entries)

Notably, `venturo` does **not** appear inside `src/` at all — no source file, comment, schema name, or view references the new project name. The rename appears to have been applied only at the package-manifest level, not woven into the codebase itself (e.g., there's no app-level branding string, no `APP_NAME` constant, no favicon/logo swap that says Venturo).

### 2.3 Inconsistent/incomplete naming summary

- **Mixed state**: package identity says "Venturo," the only user-facing branding string (page `<title>`) still says "Burak." No middle ground exists — it's a hard split between manifest-level and UI-level naming.
- **No renamed-folder-but-stale-reference cases were found** — folder/file names throughout (`Member`, `Product`, `Order`, `View`, `restaurant.controller.ts`, etc.) are generic domain terms, not references to "Burak" or "Venturo," so there's nothing structurally renamed to check for staleness beyond the one title tag.
- The GitHub remote is `git@github.com:Max-Mukhiddin/venturo.git`, and both `main` and `develop` branches exist remotely, consistent with the package name.

---

## 3. Domain Model

All entities are Mongoose schemas under `src/schema/`, paired with a `*.service.ts` in `src/models/` (naming note: `src/models/` holds business-logic *services*, not the Mongoose schemas themselves — the schemas live in `src/schema/`, which is an unusual but internally consistent naming split for this repo).

Because there is no prior version of this codebase to diff against (single commit, no "Burak" branch/tag/history), I cannot state definitively what the entities were called *before* this state — I can only describe what's here now and flag domain-specific fields that reveal the original business context (see below).

| Entity (current) | Fields | Business context revealed by field names | Naming vs. logic assessment |
|---|---|---|---|
| **Member** (`Member.model.ts`) | `memberType` (USER \| RESTAURANT), `memberStatus` (ACTIVE/BLOCK/DELETE), `memberNick`, `memberPhone`, `memberPassword`, `memberAddress`, `memberDesc`, `memberImage`, `memberPoints` | Single collection serves both end-customers and the (single) restaurant/admin account, distinguished by `memberType`. `memberPoints` implies a loyalty/rewards system tied to orders (see `OrderService.updateOrder`). | Fully domain-specific, internally consistent; no "Burak" leftovers. Cannot tell if field names changed from an earlier scheme — no history to compare. |
| **Product** (`Product.model.ts`) | `productStatus` (PAUSE/PROCESS/DELETE), `productCollection` (DISH/SALAD/DESSERT/DRINK/OTHER), `productName`, `productPrice`, `productLeftCount`, `productSize` (SMALL/NORMAL/LARGE/SET), `productVolume` (0.5–2, liters), `productDesc`, `productImages[]`, `productViews` | Restaurant-menu domain: dishes have a `productSize`, drinks have a `productVolume` (liters) — the UI (`products.ejs`) branches on `productCollection === 'DRINK'` to pick which of the two applies. `productLeftCount` implies inventory tracking. | Fully implemented and internally consistent — schema, enums, controller, service, and EJS form all agree with each other. |
| **Order** (`Order.model.ts`) | `orderTotal`, `orderDelivery`, `orderStatus` (PAUSE/PROCESS/FINISH/DELETE), `memberId` (ref Member) | `orderDelivery` fee is computed server-side (`amount < 100 ? 5 : 0` in `OrderService.createOrder`) — a free-delivery-over-threshold rule. | Fully implemented for create/list/update. No admin-side order view exists (see Section 4). |
| **OrderItem** (`OrderItem.model..ts`) | `itemQuantity`, `itemPrice`, `orderId` (ref Order), `productId` (ref Product) | Line-item breakdown of an order. Collection name is explicitly `"orderItems"` (used by the `$lookup` aggregation in `OrderService.getMyOrders`). | Functional, but the **filename itself has a typo**: `OrderItem.model..ts` (double dot before `.ts`). It still resolves and imports correctly (`import orderItemModel from "../schema/OrderItem.model."` — file name minus the trailing `ts` extension), but this is fragile and clearly unintentional. |
| **View** (`View.model.ts`) | `viewGroup` (currently only `PRODUCT`), `memberId` (ref Member), `viewRefId` | Generic "member viewed X" tracking, currently only wired up for products (`ProductService.getProduct` increments `productViews` once per member). The `ViewGroup` enum has a single value, suggesting it was designed to be extensible (e.g., to track views on other entity types later) but never extended. | Implemented only for the one use case it currently serves. |

**No "original Burak entity → Venturo entity" renaming table could be produced** — there is no evidence in this repository (no git history, no comments, no old schema file, no README) of what these entities were previously called. All five entities above appear purpose-built for a single-restaurant food-ordering domain from the state they're in now. See Open Questions.

---

## 4. Assess Completion State

| Feature area | State | Notes |
|---|---|---|
| **Member auth (customer-facing REST API)** | Fully implemented | Signup, login (JWT cookie), logout, get/update own profile, `getTopUsers` (loyalty leaderboard, top 4 by `memberPoints`), `verifyAuth`/`retrieveAuth` middleware. |
| **Member auth (admin/SSR)** | Fully implemented, but single-tenant only | `processSignup` explicitly throws `CREATE_FAILED` if a `RESTAURANT` member already exists — the system supports exactly **one** restaurant account, enforced server-side. Session-based (`express-session` + MongoDB store), separate from the JWT flow used by the REST API. |
| **Product CRUD** | Partially implemented | Create/list/update exist on both sides (REST + SSR admin). **No delete endpoint** — `ProductStatus.DELETE` exists as an enum value and is selectable in the admin `<select>` (`products.ejs`), but nothing in `ProductService`/`productController` ever removes or hard-deletes a product; setting status to DELETE just filters it out of `getProducts` (which only matches `PROCESS`). Whether "set status to DELETE" was the intended final behavior or a stub for a real delete flow is unclear — see Open Questions. |
| **Product search/filtering** | Implemented, with one likely bug | `getProducts` supports pagination, sort order, `productCollection` filter, and a case-insensitive `productName` regex search. **Bug**: `product.controller.ts:24` checks `if (ProductCollection)` (the imported *enum object*, always truthy) instead of `if (productCollection)` (the destructured query param) — so the `productCollection` filter is unconditionally copied into the inquiry object even when the query param is `undefined`, which then becomes the string `"undefined"` when filtering. This looks like it would break collection filtering rather than make it optional as intended. |
| **Order flow** | Partially implemented | Create order (with line items + computed delivery fee), list own orders (aggregated with order items + product data), update order status (with loyalty point award on transition to `PROCESS`) all exist. **No admin-side order management** — `router-admin.ts` has no order routes/views at all, so the restaurant has no way to see or process incoming orders through the admin panel; it would have to be done directly against the REST API or database. |
| **View/analytics tracking** | Implemented for its one use case | Product view counting + per-member dedup, nothing else. |
| **Admin user management** | Fully implemented | List all `USER`-type members (`users.ejs`), update a member's status (ACTIVE/BLOCK/DELETE) via AJAX. |
| **"Commerce" flows beyond ordering** (payment, cart persistence, delivery tracking, etc.) | Not present | No payment integration, no cart schema/endpoint (cart appears to be assembled client-side and posted directly to `/order/create` as a list of `OrderItemInput`), no delivery/courier concept beyond the flat fee. |
| **Customer-facing storefront (browse/search/detail/cart/checkout UI)** | **Not present in this repo** | The REST API (`router.ts`) implies a client exists to consume `product/all`, `product/:id`, `order/create`, etc., but no such frontend code is in this repository (see 1.2 and Section 5). |

### 4.1 Things that look broken or inconsistent

1. **`products.ejs:214`** — hidden input `<input name="restaurantIid" class="restaurant-id" hidden />`. This field is never populated by any script (`products.js` has no code touching `.restaurant-id`), has a typo in its `name` attribute (`restaurantIid`, double "i"), and doesn't correspond to anything in `ProductInput`/`Product` schema — the `Product` model has **no restaurant/member reference field at all**. Looks like a vestigial/never-finished attempt to scope products to a restaurant that was abandoned (consistent with the system being single-tenant, so it may simply be dead markup).
2. **`product.controller.ts:24`** — `if (ProductCollection)` bug described above (checks the enum, not the query value).
3. **`src/public/js/signup.js` `validateSignupForm()`** — every failure path explicitly `return false`s, but the success path falls off the end of the function with no explicit `return true`. Since the form uses `onsubmit="return validateSignupForm()"`, this is worth verifying in a real browser — `products.js`'s equivalent `validateForm()` does explicitly `return true` on success, so the two validators are inconsistent with each other.
4. **`src/public/js/signup.js`** — `$(".member-image").get(0).files(0)` uses function-call syntax `files(0)` instead of array/index access `files[0]`; `FileList` has no callable `files` method, so this line would throw if reached.
5. **`src/schema/OrderItem.model..ts`** — filename typo (double dot). Works because of how the `import` path is written (`"../schema/OrderItem.model."`), but a broader refactor/renaming pass could easily miss or break this.
6. **`app.ts:55` comment `// SPA: REACT`** vs. no React anywhere in the repo — either aspirational/stale comment or evidence a frontend exists outside this repository.
7. **`src/train.ts`** — a scratch file of ~30 unrelated algorithm exercises (reversing strings, palindrome checks, etc.) with its own `npm run train` script in `package.json`. Not part of the application; looks like leftover practice code rather than anything tied to the Burak→Venturo migration.
8. **Two jQuery versions loaded on every EJS page** (`header.ejs:19,33` — jQuery 3.2.1 slim and jQuery 3.3.1 full, both from CDN) — redundant, not necessarily broken, but worth noting as leftover template cruft.
9. **`src/app.ts:23`** — `app.use("/uploads", express.static("./uploads"));` serves uploaded files from a relative path, and `.env`/`.gitignore` confirm `uploads/` is gitignored (empty/absent in this checkout) — expected for a template but means the deployed image directory isn't present locally.
10. Session secret is hardcoded as the literal string `"This is a secret"` in `app.ts:33`, while `.env` separately defines `SESSION_SECRET` that is never read anywhere in the code. This looks like a half-finished wiring of the session secret to the environment variable.

---

## 5. Frontend Flow

Only one real "frontend" exists in this repository: the **server-rendered admin panel** under `/admin`, built with EJS + Bootstrap 4 + jQuery. There is no customer-facing browsing UI in this repo (see Section 4).

### 5.1 Admin panel route map (`src/router-admin.ts` → `restaurant.controller.ts` / `product.controller.ts`)

| Route | Method | Auth | Renders/Does |
|---|---|---|---|
| `/admin` | GET | none | `home.ejs` — landing page with animated sphere; nav differs based on `res.locals.member` (logged in or not) |
| `/admin/login` | GET/POST | none | `login.ejs` → POST processes via session, redirects to `/admin/product/all` |
| `/admin/signup` | GET/POST | none | `signup.ejs` → POST always forces `memberType = RESTAURANT`, uploads one `memberImage`, redirects to `/admin/product/all` |
| `/admin/logout` | GET | none | destroys session, redirects to `/admin` |
| `/admin/check-me` | GET | none | debug/utility route — alerts current session member's nick or "not authenticated" |
| `/admin/product/all` | GET | `verifyRestaurant` | `products.ejs` — table of all products + inline "new product" form (multi-image upload, up to 5) |
| `/admin/product/create` | POST | `verifyRestaurant` | creates product, redirects back to product list with a JS alert |
| `/admin/product/:id` | POST | `verifyRestaurant` | updates a product's status via AJAX from `products.js` (dropdown `<select>`) |
| `/admin/user/all` | GET | `verifyRestaurant` | `users.ejs` — table of all `USER`-type members with status dropdown |
| `/admin/user/edit` | POST | `verifyRestaurant` | updates a member's status via AJAX from `users.js` |

**Primary admin user flow:** `/admin` (home) → signup or login as the restaurant → `/admin/product/all` (default landing post-auth) → create/pause/delete products inline, or navigate to `/admin/user/all` to moderate customer accounts → logout.

Auth gate: `verifyRestaurant` checks `req.session.member.memberType === RESTAURANT`; if not, every protected admin action replies with an inline `<script>alert(...); window.location.replace('/admin/login')</script>` rather than a normal redirect or JSON error — consistent pattern across `restaurant.controller.ts` and `product.controller.ts`'s SSR-facing handlers.

### 5.2 REST API "route map" (`src/router.ts`, mounted at `/`)

This has no views of its own — it's pure JSON, intended (per the `app.ts` comment) for a React SPA client that isn't in this repo:

| Route | Method | Auth |
|---|---|---|
| `/member/restaurant` | GET | none — fetch the single restaurant's public profile |
| `/member/signup`, `/member/login` | POST | none |
| `/member/logout` | POST | `verifyAuth` |
| `/member/detail` | GET | `verifyAuth` |
| `/member/update` | POST | `verifyAuth` + single `memberImage` upload |
| `/member/top-users` | GET | none |
| `/product/all` | GET | none |
| `/product/:id` | GET | `retrieveAuth` (optional — attaches member if token present, doesn't block if absent) |
| `/order/create` | POST | `verifyAuth` |
| `/order/all` | GET | `verifyAuth` |
| `/order/update` | POST | `verifyAuth` |

Implied (but not present in this repo) customer flow, inferable purely from the shape of this API: **signup/login → browse `/product/all` (filter by collection/search) → view `/product/:id` (increments view count, dedup'd per member) → add to cart client-side → `/order/create` → track status via `/order/all`.** No code in this repository implements the "browse/cart/checkout" UI itself.

---

## Open Questions

These could not be determined confidently from the repository and need clarification:

1. **Where is the customer-facing frontend?** `app.ts` explicitly comments the `/` router as feeding a React SPA, but no React project, `client/` folder, or separate repo reference exists here. Is it in a separate repository, not yet started, or was the comment simply never removed?
2. **What did "Burak" actually name, structurally?** With only one commit and a single leftover `<title>Burak</title>`, I cannot tell whether "Burak" was the name of this exact restaurant-ordering app (i.e., this is a like-for-like rename) or whether "Burak" was a generic multi-purpose template that got specialized into a single-restaurant food app as part of "becoming Venturo." Was there scope/domain change as part of the rename, or naming-only?
3. **Is `productStatus: DELETE` meant to be a soft-delete only, or is a hard-delete endpoint still to be built?** The admin UI exposes DELETE as a status option but no code path removes the document.
4. **Is the system intentionally single-tenant (one restaurant per deployment)?** `MemberService.processSignup` hard-blocks a second `RESTAURANT` signup. Worth confirming this is by design for Venturo rather than an unmigrated assumption from Burak.
5. **What was the hidden `restaurantIid` field on the product form for?** Given there's no restaurant reference on the `Product` schema at all, was multi-restaurant product ownership planned and abandoned, or is this simply dead markup that should be deleted?
6. **Should `SESSION_SECRET` from `.env` be wired into `express-session`'s `secret` option** instead of (or in addition to) the hardcoded `"This is a secret"` string in `app.ts`? It's defined in `.env` but never referenced in code.
7. **Is `src/train.ts` (and its `npm run train` script) intentionally kept in the repo**, or is it leftover scratch work that should be removed?
8. **Is there an intended admin-side order management view?** The admin panel has no route/view for restaurant staff to see or update incoming orders, even though the REST API fully supports order status transitions from the customer/member side.
