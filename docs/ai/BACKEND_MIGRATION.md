# Backend Migration — Burak → Venturo

Source material: [VENTURO_AUDIT.md](../VENTURO_AUDIT.md), [VENTURO_ER_MODEL.md](../VENTURO_ER_MODEL.md), [AGENTS.md](../AGENTS.md), and the commit history of this repository (`7b1e0a9 feat: initial setup venturo` → `9786040 feat: start migration process`).

## Original project summary — "Burak"

A single-tenant Express 4 + TypeScript + Mongoose 6 backend for restaurant food ordering, with two front-facing surfaces:

- A REST JSON API mounted at `/` (`src/router.ts`) for member auth, product browsing, and ordering — consumed by an external client (comment in `src/app.ts` calls it a React SPA; no such client exists in this repo).
- A server-rendered EJS admin panel mounted at `/admin` (`src/router-admin.ts`), styled with Bootstrap 4 + jQuery, for the one restaurant account to manage its menu and customers.

Domain model at that point: `Member.memberType` was `USER | RESTAURANT`; `Product.productCollection` was food categories (`DISH | SALAD | DESSERT | DRINK | OTHER`); drinks additionally carried a `ProductVolume` (liters) while dishes carried a `ProductSize`; the admin `<title>` read "Burak"; system was hard-limited to exactly one `RESTAURANT`-type member (`MemberService.processSignup` rejects a second signup).

## New project summary — "Venturo"

Same architecture, same two surfaces, same single-tenant constraint — the domain was repointed from restaurant food ordering to adventure/outdoor-equipment e-commerce. `Member.memberType` is now `USER | ADMIN`; `Product.productCollection` is `CLIMBING | CAMPING | HIKING | TREKKING | CYCLING | APPAREL | FOOTWEAR | OTHER`; the drink-specific `ProductVolume` concept was removed outright rather than generalized; `ProductSize` became a genuinely optional field (no schema default) since not every category uses sizing; the admin `<title>` reads "Venturo". A customer-facing storefront (`venturo-react`) is planned but does not live in this repository — see [VENTURO_ER_MODEL.md](../VENTURO_ER_MODEL.md) for what it will need from this backend.

## Backend migration goal

Complete the rename that commit `7b1e0a9` started at the package-manifest level only (`package.json`/`package-lock.json` said "venturo"; nothing in `src/` did), while fixing the concrete bugs and dead code the audit surfaced along the way, without restructuring the application or expanding scope beyond what was explicitly requested in each pass. The end state: no source-visible trace of the food-ordering domain or the "Burak" name, a schema that matches the new product domain, and documentation (`AGENTS.md`, `VENTURO_AUDIT.md`, `VENTURO_ER_MODEL.md`) a future session or contributor can pick up from without re-deriving history.

## Naming changes

| Where | Before | After | Notes |
|---|---|---|---|
| `src/views/includes/header.ejs` | `<title>Burak</title>` | `<title>Venturo</title>` | Only literal "Burak" string in the entire repo; shared by every admin page via `include('includes/header')`. |
| `src/libs/enums/member.enum.ts` | `MemberType.RESTAURANT = "RESTAURANT"` | `MemberType.ADMIN = "ADMIN"` | Enum value renamed; every comparison/assignment site updated (see REST API Contract Changes). |
| `src/views/signup.ejs` | `<input name="memberType" value="RESTAURANT" hidden />` | `value="ADMIN"` | Form payload kept in sync with the enum rename. |
| `package.json` / `package-lock.json` | `"name": "burak"` (implied by original template) | `"name": "venturo"` | Already done in the initial-setup commit, before this migration pass began. |
| UI copy: `login.ejs`, `signup.ejs`, `signup.js`, `Errors.ts` | "Restaurant *" label, "restaurant image" upload copy/alert, `BLOCKED_USER` message "contact the restaurant" | "Store *", "store image", "contact the store" | Wording-only; no data model impact. |
| `src/views/products.ejs` | "RESTAURANT MENU" heading | "PRODUCT CATALOG" | Wording-only. |

**Deliberately left unrenamed** (out of scope — these are code identifiers, not the enum value or user-visible copy the migration targeted): `restaurant.controller.ts` filename, the `restaurantController` object and its `getRestaurant`/`verifyRestaurant` members, the `/member/restaurant` and `/admin/*` route identifiers, and CSS classes such as `.dish-container` / `.restaurant-menu-frame` / `.new-dish-txt`. See [DECISIONS.md](DECISIONS.md) for the reasoning.

## Module changes

**Folder structure is unchanged.** `src/controllers/`, `src/models/` (service classes, not schemas), `src/schema/` (Mongoose schemas), `src/libs/{enums,types,utils}/`, and `src/views/` all kept their pre-migration shape and responsibilities — this was an enum/value/copy migration, not a restructuring.

The only file-level changes:

| Change | File | Reason |
|---|---|---|
| Renamed | `src/schema/OrderItem.model..ts` → `src/schema/OrderItem.model.ts` | Pre-existing double-dot typo in the filename; import in `Order.service.ts` updated to match. Unrelated to the Burak/Venturo rename — a latent bug the audit surfaced. |
| Deleted | `src/train.ts` (+ its `npm run train` script in `package.json`) | Scratch file of unrelated algorithm exercises with no connection to the application; dead weight identified in the audit. |
| Removed | Hidden `restaurantIid` input in `src/views/products.ejs` | Dead markup — typo'd name, never read by any script, and `Product` has no restaurant/member reference field for it to populate. |
| Removed | `productCollection === "DRINK"` show/hide handler in `src/public/js/products.js` | Dead once `ProductVolume` and the DRINK-specific UI branch were removed. |

## REST API contract changes

**No route paths changed** — `src/router.ts` and `src/router-admin.ts` are byte-for-byte identical to the pre-migration commit (verified via `git diff`). Everything below is a payload/enum-value change on the existing routes, not a routing change.

| Route(s) | Method | Contract change |
|---|---|---|
| `POST /member/signup`, `POST /member/login`, `GET /member/restaurant`, `GET /member/detail`, `GET /member/top-users` | various | Any `memberType` value of `"RESTAURANT"` in a request or response body is now `"ADMIN"`. |
| `GET /product/all`, `GET /product/:id` | GET | `productCollection` values are now `CLIMBING\|CAMPING\|HIKING\|TREKKING\|CYCLING\|APPAREL\|FOOTWEAR\|OTHER` (was `DISH\|SALAD\|DESSERT\|DRINK\|OTHER`). `productVolume` no longer appears in the response at all. `productSize` may now be absent/`null` (previously always defaulted to `"NORMAL"`). |
| `GET /product/all?productCollection=...` | GET | **Behavior fix, not just a value change**: the collection filter was silently broken before this pass (`product.controller.ts` checked the truthy enum object instead of the query param, so the filter never actually applied). It now filters correctly — clients that were unknowingly getting unfiltered results will start getting filtered ones. |
| `POST /order/create`, `GET /order/all`, `POST /order/update` | POST/GET | No shape change to `Order`/`OrderItem` payloads. Indirectly affected only in that `productId` references now point at products carrying the new `productCollection` vocabulary. |
| `POST /admin/signup` (SSR form, not JSON) | POST | Hidden `memberType` field value `"RESTAURANT"` → `"ADMIN"`. |
| `POST /admin/product/create` (SSR form) | POST | No `productVolume` field submitted; `productCollection` select now offers the new category values; `productSize` select behavior unchanged (still always submits a value from the UI, even though the schema no longer requires or defaults it). |
| `GET /admin/product/all` (SSR render) | GET | Table's "Product Volume" column replaced with "Product Size"; renders `-` when a product has no size set. |

## MongoDB schema changes

| Schema | Field | Before | After |
|---|---|---|---|
| `Product` | `productCollection` | enum `DISH\|SALAD\|DESSERT\|DRINK\|OTHER`, required | enum `CLIMBING\|CAMPING\|HIKING\|TREKKING\|CYCLING\|APPAREL\|FOOTWEAR\|OTHER`, required |
| `Product` | `productVolume` | `String`, enum `ProductVolume` (`0.5\|1\|1.2\|1.5\|2`), default `"1"` | **removed entirely** — field, enum, and unique-index reference all deleted |
| `Product` | `productSize` | `String`, enum `ProductSize`, default `"NORMAL"` | `String`, enum `ProductSize`, **no default** — genuinely optional now |
| `Product` (index) | compound unique index | `{ productName: 1, productSize: 1, productVolume: 1 }` | `{ productName: 1, productSize: 1 }` |
| `Member` | `memberType` | enum `USER\|RESTAURANT` | enum `USER\|ADMIN` |
| `OrderItem` | — (no field change) | schema unchanged; only the **filename** was fixed (`OrderItem.model..ts` → `OrderItem.model.ts`) | |
| `Order`, `View` | — | **unchanged** — not touched in this migration; see [VENTURO_ER_MODEL.md](../VENTURO_ER_MODEL.md) for what they'll need for the full storefront (order tracking, wishlist, etc.) | |

No migration/backfill script exists or was requested for existing documents — any pre-existing `Product` documents with `productCollection: "DISH"` etc. or a populated `productVolume` value are **not** transformed by this pass; this is a schema/code-level change only. Flag as an open item if production data with old enum values exists (see [NEXT_STEPS.md](NEXT_STEPS.md)).

## Compatibility notes for the frontend (venturo-react)

Anything client-side that consumes this API must:

1. Send/expect `memberType: "ADMIN"` instead of `"RESTAURANT"` anywhere it distinguishes the store account from a customer.
2. Use the new `productCollection` enum values (`CLIMBING`, `CAMPING`, `HIKING`, `TREKKING`, `CYCLING`, `APPAREL`, `FOOTWEAR`, `OTHER`) for category filters, dropdowns, and display labels — the old food categories no longer exist server-side and will be rejected by the schema's `enum` validator if submitted on create/update.
3. **Stop sending or expecting `productVolume`** on any product create/update/display flow — the field is gone from the schema and the type. Sending it will simply be ignored by Mongoose (not in the schema), not error, but it's dead weight.
4. Treat `productSize` as optional/nullable in the UI — do not assume every product has a size, and do not rely on a server-side default of `"NORMAL"`.
5. `GET /product/all?productCollection=...` filtering now actually works — a frontend built against the old (broken) behavior that compensated by filtering client-side can drop that workaround.
6. No REST route paths changed, so URL construction/client SDK route definitions do not need updates — only payload shapes and enum vocabularies do.
7. There is currently no cart/order-tracking richness beyond what's described in [VENTURO_ER_MODEL.md](../VENTURO_ER_MODEL.md) (`Order` has no address snapshot, no status timeline) — plan the storefront's Order Track page against that gap analysis, not against an assumption of existing support.
