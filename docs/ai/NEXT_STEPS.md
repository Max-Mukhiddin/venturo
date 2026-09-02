# Next Steps — Venturo

Priority order within each category (highest priority first). Backend cleanup items map directly to the nine open questions in [VENTURO_ER_MODEL.md](../VENTURO_ER_MODEL.md)'s "Open Questions" section — resolving them is what unblocks implementing the entities proposed there.

## Backend cleanup (resolve the 9 ER-model open questions)

| Priority | Open question (from VENTURO_ER_MODEL.md) | Why it's next | Blocks |
|---|---|---|---|
| 1 | **Wishlist placement** — separate `Wishlist` collection vs. embedded `productId[]` array on `Member`? | Cheapest to decide (two concrete options, no unknowns), and Wishlist is one of only two hard "new entity" gaps (with Blog) — nothing else depends on this decision. | Implementing Wishlist; the "My Account" wishlist tab. |
| 2 | **Order address capture** — single string vs. structured fields (street/city/postal/etc.)? | `Order` has *no* address field today at all — this is the most concrete, highest-value gap (Order Track can't show "shipping to..." without it), and the answer is a schema-shape decision that should be made once, not iterated on after data exists. | Any Order Track UI work; the `orderAddress` field proposed in `BACKEND_MIGRATION.md`. |
| 3 | **Order Track granularity** — does `OrderStatus` need more values, or a full `statusHistory` timeline array? | Directly follows from #2; both are needed before touching the `Order` schema, so resolve them together to avoid a second migration. | The Order Track page design; `trackingNumber`/`statusHistory` field additions. |
| 4 | **Stock/availability display** — should Shop List/Detail hide, disable, or badge zero-`productLeftCount` items? | Pure UI/product decision with a field that already exists (`productLeftCount`) — no schema work, just needs an answer so the frontend isn't guessing. | Shop List (PLP) and Shop Detail (PDP) frontend work. |
| 5 | **Blog authorship** — single implicit store byline, or multi-author with an `authorId` ref? | Given the single-tenant model (one `ADMIN` account), this likely has an easy default answer, but should be confirmed before the `BlogPost` schema is written, not after. | `BlogPost` schema design. |
| 6 | **Blog taxonomy** — flat `tags: string[]` vs. a dedicated `BlogCategory` entity? | Depends on whether category landing pages are planned; lower urgency than authorship since tags can be added to a schema without a breaking change later, but category pages are a bigger commitment. | `BlogPost` schema design; Blog List page filtering. |
| 7 | **PDP reviews/ratings** — in scope for launch or a later phase? | No existing schema support at all; wasn't in the original gap-analysis request, so likely lower urgency, but needs an explicit yes/no so it isn't silently dropped. | Shop Detail (PDP) frontend scope; a potential future `Review` entity. |
| 8 | **FAQ** — does content need non-engineer editability (DB-backed), or can it stay static? | No technical urgency — static is a safe default and reversible later — but should be confirmed before frontend work assumes one or the other. | FAQ page implementation approach. |
| 9 | **Contact Us** — does a submission need to persist (admin inbox) or is it fire-and-forget email? | Same reasoning as FAQ: lowest technical urgency of the nine, safe to decide last, but also gates whether a mail-sending dependency needs to be added to `package.json`. | Contact Us page implementation approach; potential `ContactMessage` entity. |

## Frontend-facing coordination (with venturo-react)

1. Share the **Compatibility Notes** section of `BACKEND_MIGRATION.md` with whoever/whatever session is building `venturo-react` — specifically the `memberType: "ADMIN"` rename, the new `productCollection` vocabulary, `productVolume` removal, and `productSize` now being optional.
2. Confirm whether **existing MongoDB data** (if any exists outside a fresh dev database) has `Product` documents with the old `productCollection` values (`DISH`/`SALAD`/`DESSERT`/`DRINK`) or a populated `productVolume` field — no migration/backfill script was written for this pass (see `BACKEND_MIGRATION.md`'s MongoDB Schema Changes section). If real data exists, a one-time backfill/cleanup script is needed before the frontend goes live against it.
3. Confirm the frontend has dropped any client-side workaround for the `productCollection` filter bug (`GET /product/all?productCollection=...` now actually filters — see `BACKEND_MIGRATION.md` REST API Contract Changes) so filtering isn't accidentally applied twice.
4. Once Priority 1–3 backend-cleanup decisions land (Wishlist, Order address, Order Track granularity), share the resulting schema shapes before the frontend builds My Account / Order Track against guesses.

## Testing

1. **There is currently no automated test suite** — `package.json`'s `test` script is still the default placeholder (`"echo \"Error: no test specified\" && exit 1"`). Before further backend work accumulates, add at minimum a regression test for the `productCollection` filter fix (Session 2, Section 1) since it was a silent behavioral bug once and has no coverage preventing a recurrence.
2. Manually re-verify the admin panel end-to-end (`/admin` → signup/login → `/admin/product/all` create/pause/delete-status a product → `/admin/user/all` block/unblock a user → logout) since Session 2 touched `signup.ejs`, `products.ejs`, `login.ejs`, `products.js`, and `signup.js` directly — `tsc --noEmit` passing confirms type-correctness, not that the rendered forms/JS behave correctly in a browser.
3. Verify a fresh `Product` document can be created **without** a `productSize` (confirming the now-optional field truly has no default and no hidden `required` validator left over).
4. Verify the compound unique index (`{ productName: 1, productSize: 1 }`) behaves as expected now that `productSize` can be absent — confirm whether multiple same-named products with no size collide under the index (Mongo treats missing fields as `null` for indexing purposes by default, which can cause unexpected duplicate-key errors across unrelated products that both omit size).
5. `POST /contact/submit` is public and unauthenticated by design (matching `/member/signup`'s no-auth pattern) — flagging as a future spam/abuse surface that will need rate-limiting or similar hardening. Not something to fix in this pass, but shouldn't go live without it.

## Known bugs, not yet fixed

Found during the live endpoint validation pass (server run against the dev database, `POST`/`GET` hit directly). Logged, not fixed — none of these were in scope for the changes that surfaced them.

1. **`GET /product/all` returns 500 instead of defaulting when `page`/`limit` are omitted.** `ProductService.getProducts` computes `$skip: (inquiry.page * 1 - 1) * inquiry.limit`; if the query string omits `page`/`limit`, `Number(undefined)` is `NaN`, and MongoDB rejects the aggregation with `invalid argument to $skip stage: Expected an integer, but found NaN`. Pre-existing — not touched by the Session 7 sort-logic fix. A public listing endpoint 500ing on a missing-but-plausible query param (rather than defaulting to, say, page 1 / a sane limit) is a real gap for the future Shop List page.
2. **`POST /wishlist/add` returns `201 Created` on the no-op path, not `200 OK`.** `WishlistService.addToWishlist`'s duplicate-add path correctly avoids creating a second document (verified live: identical `_id`/`createdAt` on repeat calls), but the controller returns `201` regardless of whether a document was actually inserted or an existing one was returned. A client relying on the status code to detect "this was a fresh add" will get a false positive on repeat calls.
3. **`tsconfig.json` has no `outDir`, and `uploads/` isn't created on a fresh checkout.** `npm run build` compiles `.js` files directly into `src/`, alongside the `.ts` sources they're compiled from (confirmed: 48 files, none gitignored, since there's no `dist/` to have gitignored). Beyond repo clutter, this is a real footgun: `ts-node` can pick up a stale sibling `.js` over the `.ts` source it's supposed to compile, silently running old code. Separately, `uploads/members`/`uploads/products` (referenced by `src/libs/utils/uploader.ts`) don't exist on a fresh checkout and multer doesn't auto-create them — any image upload (member signup, product creation) 500s with `ENOENT` until those directories are created manually.

## Documentation

1. **Article and ContactMessage admin management is JSON-only** as of the product-entity implementation pass — `GET/POST /admin/article/*` and `GET/POST /admin/contact/*` exist and work, but there are no EJS templates for them (unlike `products.ejs`/`users.ejs`). A non-technical store owner cannot actually use these features through the admin panel yet; new EJS views (list + create/edit forms, matching the existing `products.ejs` pattern) are still required before this is usable end-to-end.
2. Resolve the flagged **`CLAUDE.md`/`AGENTS.md` duplication** (both exist at the repo root with identical content as of commit `9786040`) — either designate one as canonical and delete the other, or explicitly document why both are intentionally kept in sync, so future edits don't silently drift.
3. As each ER-model open question is resolved, update `VENTURO_ER_MODEL.md`'s "Open Questions" section to reflect the decision (move it from "open" to a dated resolution note) rather than leaving answered questions listed as open.
4. `BACKEND_MIGRATION.md`'s MongoDB Schema Changes table and `VENTURO_ER_MODEL.md`'s ER diagram now need updating to reflect the `Wishlist`/`Article`/`ContactMessage`/`Review` entities and the `Order.shippingAddress`/`OrderStatus` changes implemented in this pass — both currently still document the pre-storefront state only.
5. No `README.md` exists at the project root — consider whether one is needed for onboarding, separate from the AI-agent-focused `AGENTS.md`/`CLAUDE.md` instruction files.

## Frontend (venturo-react) Sessions

# Next Steps — Venturo-React

This repo's own next-steps log — separate from the backend's
`../venturo/docs/ai/NEXT_STEPS.md`. Items are flagged during migration-plan
execution (see `docs/ai/COMPLETED_TASKS.md`) but explicitly deferred, not
fixed, at the time they were found.

## `public/img/banner.webp` is now orphaned — safe to delete

Its only reference was `OtherNavbar`'s old CSS background rule, removed
when `OtherNavbar.tsx`/`navbar.css` were rebuilt to the HikMali
palette/structure (same treatment as `HomeNavbar`'s Section 1 rebuild).
Not deleted in this pass, per the established convention of flagging
orphaned assets rather than deleting them without explicit confirmation.

## `ActiveUsers.tsx` needs a HikMali-consistent restyle

Kept intentionally when the other old Burak-era homepage sections were
deleted (`Statistics`/`PopularDishes`/`NewDishes`/`Advertisement`/
`Events`) — it's genuinely wired to real backend data
(`MemberService.getTopUsers()`) with no equivalent among the 12 HikMali
sections, so deleting it would have lost real functionality, not just old
styling. Still on the old Burak palette/typography (`#f8f8ff` background,
"Dancing Script" heading font, purple default-avatar accent) rather than
the olive/sage/cream HikMali palette used everywhere else. Needs a visual
restyle pass, not a rebuild — the data wiring is correct as-is.

## Backend gap: no price-range filtering on `GET /product/all`

Checked directly, not assumed: `../venturo/docs/ai/API_REFERENCE.md`
documents this route's full query param list (`page`, `limit`, `order`,
`sortDirection`, `productCollection`, `search`) with no min/max price
param, and `Product.service.ts`'s `getProducts` confirms it at the code
level — the aggregation's `match` object only ever sets `productStatus`,
`productCollection`, and a `productName` regex; there's no `productPrice`
range logic (`$gte`/`$lte` or otherwise) anywhere in the function.

If the Shop List (Products) page needs a price filter UI, the backend
route needs min/max query param support added first — that's backend
work to scope, not something to fake with a client-side workaround
(fetching everything and filtering in the browser would break pagination
and defeat the point of server-side filtering). Flagged here so it isn't
assumed to already exist when that page's functionality is next touched.

**Same root cause, second symptom — homepage category item counts were
deliberately omitted.** The Figma "Shop by Category" section (node
`2479:1302`) shows an item count under each category card (24 / 61 / 53 /
12 / 26). Those are invented mockup numbers, and there is no way to
render real ones: `GET /product/all` returns a bare array with no total
count, so a true per-category total can't be obtained (counting a page of
results only ever yields a value capped at `limit`). Rather than ship
fabricated figures on the homepage, `ShopByCategory.tsx` renders the
category name only, with the caption spacing re-tuned so it reads as a
designed single-line label. **This is reversible**: if a count endpoint
(or a `total` field on the existing route) is added, the second line can
be restored to match the design exactly; if visual fidelity matters more
than data honesty in the meantime, the static numbers can be dropped back
in. Recorded here so the decision isn't silently lost as the visual pass
moves on to later sections.

## ~~`Products.tsx` can't be deep-linked~~ — RESOLVED

**Fixed.** `Products.tsx` holds both its `productCollection` filter and its
`order` in local state and never read either from a query param, so nothing
could link *into* a pre-filtered or pre-sorted product view. Three homepage
sections had fallen back to a plain `/products` link because of it:

- Section 3 "Shop by Category" — all five category tiles (needed `productCollection`)
- Section 4 "Best Products" — the "Shop All Categories" link (needed `productCollection`)
- Section 5 "Banner" — both panels, "New Arrivals" / "Best Sellers" (needed `order`
  specifically — `createdAt` / `productViews`)

Fix: `Products.tsx` now seeds its initial `productSearch` state from
`location.search` via a lazy `useState` initializer (`parseInitialProductSearch`)
— runs once on mount, no new effect, in-page filter/sort controls untouched.
`productCollection` is validated against the real enum before being trusted;
an unrecognized/missing value falls back to the pre-existing default
(`CLIMBING`). `order` has no client-side whitelist — same as before this fix,
the backend already whitelists-with-fallback per `API_REFERENCE.md`.

All three call sites updated to build real URLs
(`?productCollection=<value>`, `?order=<value>`). `BestProducts`' "Shop All
Categories" link additionally carries through whichever category is
currently active in that section's own (already-functional, not
navigation-based) filter row, so filtering there and clicking through lands
on the matching view instead of resetting to unfiltered.

Verified live (real headless Chromium, real backend): all three link types
confirmed via the actual `GET /product/all` request fired, not just the URL
bar — see `docs/ai/COMPLETED_TASKS.md`. `search` was left out of scope, since
none of the three call sites needed it and it wasn't part of what was asked.

## Highlights card (Section 6) ships with no price shown anywhere

The Figma "Highlights" section's product card (node `7:60`, and its mobile
counterpart `7:148`) has no price element in the source at all — just
name, description, and a plain "Add To Cart" button, unlike Best
Products' hover-reveal `| $price` treatment. Confirmed by pulling the full
`get_design_context` for both nodes directly, not inferred from metadata.

Asked the user how to handle it rather than guessing: match the source
exactly (no price shown) vs. reuse Best Products' hover-price pattern
anyway. Decision was to match the source exactly — the card ships with no
visible price, same as the design. Recording this here since it's a real
UX asymmetry with the rest of the site (every other product card shows a
price somewhere) in case it's worth revisiting once a real backend
"featured product" concept exists.

Same card's "20% Off" badge was omitted for the now-standard reason: no
discount field on `Product`, same resolution as every prior card.

## Deals Of The Day (Section 7) ships with no countdown timer

The Figma "Deals Of The day" section (node `7:90`) pairs a countdown
timer with a 4-product grid. Checked `Product.model.ts` and the rest of
the backend schema directly — there is no expiry/sale-window/deal-end
field anywhere, so a live countdown would have to tick down to an
invented end-time (the same class of problem as a fabricated discount
badge, just animated). Raised to the user with two real options before
writing any component code, same as Banner's gender-panel question:

1. Omit the countdown entirely, plain heading over the grid.
2. Keep the timer-block styling but freeze it / use a non-numeric label
   so it reads as decorative rather than a real countdown.

**Decision: option 1** — the countdown is omitted entirely. If the
backend ever gains a real time-limited-deal concept (an expiry field on
`Product` or a separate "Deal" entity), this section is the natural place
to revisit and reinstate a real countdown.

The design's Lorem Ipsum body copy next to the countdown was also
dropped (confirmed literal placeholder text via the design context, and
absent from the mobile frame entirely) rather than replaced with invented
descriptive copy.

The grid's sort (`order=averageRating`) was chosen specifically to avoid
duplicating Best Products' (`productViews`) or Banner's
(`createdAt`/`productViews`) slices. A "low stock" sort — arguably a more
literal reading of "deals" — was considered and ruled out:
`productLeftCount` is not in the backend's `ProductSortBy` whitelist
(`product.enum.ts`), so passing it as `order` silently falls back to
`createdAt` rather than actually sorting by stock. If a real "deals"
concept is ever added to the backend, revisiting the sort field (or
adding `productLeftCount` to the whitelist) would make this section's
premise more literal than a rating-based proxy.

**Price-on-button — checked specifically, not a breakpoint split.** The
mobile frame (`7:149`) has only 2 visible cards; card 1 shows
`"Add To Cart | $ 25.00"` and card 2 doesn't. Initially this looked like
it might parallel Highlights' clean desktop-only heading, but re-checking
confirmed it's the same single-decorated-card inconsistency that also
puts the "20% Off" badge on 2 of the 4 desktop cards — price is
inconsistent *within* mobile itself, not a genuine mobile-shows-it /
desktop-doesn't rule. Unlike the badge, `productPrice` is real,
non-fabricated backend data, so showing it uniformly across all 4 cards
was a real option, not just a normalization call — raised to the user
explicitly. **Decision: kept omitted on all 4 cards at every width**,
matching the majority/primary (desktop) treatment. Revisit if this
section's cards are ever redesigned with consistent per-card content.

## Section 8 "Testimonial" was skipped entirely — not built this session

Figma node `7:122` (desktop) / `7:150` (mobile). Checked `Review.model.ts`
(`memberId`/`productId`/`rating`/`comment`/`createdAt` only — no
like-count, no social-handle, no video-review concept), `Member.model.ts`
(`memberNick`/`memberImage` exist), and `review.controller.ts` (only
`getProductReviews(productId)` is exposed — no site-wide "all reviews"
endpoint). Live dev data has exactly **one** real review across the whole
database.

Every specific value in the design is fabricated with no schema
equivalent: "150,000+" customers, "Over All Reviews (45)", all 4 cards
hardcoded to the same placeholder identity ("Alexis Ohanian
@alexisohanrian") with a fabricated "75" like-count and "June 2020" date,
a Twitter icon with no backing field, and one card is a fake YouTube
video embed. This is deeper than prior sections' single-field flags — the
section's whole premise (a populated testimonial wall) has no real
backing at current dev-data scale.

Raised to the user with two options: omit entirely, or build with only
real data however sparse (~1 card right now). **Decision: omit entirely.**
To build this section for real in the future, in order of what's needed:
1. A site-wide review-listing endpoint (today's `getProductReviews` is
   per-product only).
2. More seed review data — at least a handful of real reviews with
   `comment` text, so cards aren't mostly empty.
3. A product decision on what to show for the currently-unbackable
   fields: drop the aggregate customer-count and review-count entirely,
   drop likes and social handles (no such fields exist), drop the video
   card format, and use `Review.createdAt` (real, already exists) instead
   of a fabricated date.

## Product Details (Section 9) dropped a fake brand watermark and other unbacked content

Figma node `7:140` (mobile `7:151`). The circular seal overlaid on the
product image read "ADVENTURE MOUNTAIN OUTDOOR ESTD 2021" — a different,
fake brand identity, not just missing data. Raised to the user with two
options (omit vs. replace with the real Venturo mark) before building.
**Decision: replaced with the real `venturo-badge.svg`**, same asset
already used in the header, same watermark position/treatment.

Also dropped, all with no schema equivalent: the "Save 20% Off" badge and
struck-through original price (no discount field, only a single
`productPrice`), the apparel-specific bullet list (irrelevant to outdoor
gear, no schema field), the "This is a demonstration store..." /
"Together we will find the perfect..." filler copy (replaced with the
real `productDesc`), and the "Size Chart"/"Ask questions" accordion rows
(no size-chart data or Q&A feature exists anywhere in this app — dropped
entirely rather than shipped as dead UI, same as the hero's removed
"next" control).

The design's "S / M / L / XL" size picker implies selectable size
*variants*; `ProductSize` is actually a single fixed value per product
(`SMALL/NORMAL/LARGE/SET`). Rendered as an inert label of the product's
real size instead. If a real multi-size-per-product concept is ever added
to the backend, this section is the natural place to build a real picker.

Added `sortDirection` to the frontend `ProductInquiry` type and
`ProductService.getProducts` (the backend already supported it, just
wasn't exposed) so this section could feature the real highest-priced
product (`order=productPrice, sortDirection=DESC`) without duplicating
any prior section's sort. Available to any future section that needs it.

## For future reference: Section 10 "Instagram" is decorative-only, not a live feed

No ambiguity, nothing deferred — the 6 tiles ship as flat placeholder
panels (see `docs/ai/COMPLETED_TASKS.md`). Noting only what a real
integration would need later, if ever wanted: an Instagram API key/token
and the brand's actual real Instagram handle — neither exists today.

## Footer (Section 12) newsletter signup has no real backend endpoint

Figma node `2012:455`. The form renders as designed ("Sign up for 10%
off your first order," email input, Subscribe button) but has nowhere
real to submit to — no email-capture concept exists anywhere in the
backend schema. `onSubmit` currently just prevents default and does
nothing; no fake success state was shipped. To make this real: an
endpoint to capture an email (plus, if the "10% off" is meant literally,
a real discount-code mechanism — which doesn't exist either, see the
no-discount-field notes on Sections 4/6/7/9).

## Footer (Section 12) dropped a duplicate "Learn" column and several unreal links

The design's "Shop" and "Learn" footer columns are literally identical
content in the source ("All Products / Care / Service / Trekking /
Hiking"), confirmed on both the desktop and mobile nodes — not a one-off
mockup slip. Consolidated to a single real "Shop" column (All Products,
Trekking, Hiking — the latter two deep-linked via
`?productCollection=`) and dropped "Learn" entirely, since it had no
distinct real content of its own.

Also dropped, all with no real destination anywhere in this app: "Care,"
"Service," "Wholesale," "Sitemap." "FAQs" was kept — `/help` has a real
FAQ tab. If real content or pages for any of the dropped items is ever
added (a care/service guide, a wholesale program, a sitemap page), this
is the place to restore them as real links rather than placeholders.

Also fixed the same underlying problem in the *pre-existing* footer
(predating this rebuild, not just the new mock): `devexuz@gmail.com`,
a Dubai address, a `+971` phone number, and "© Copyright Devex Global"
were all leftover template-vendor placeholders, not real Venturo
details. Dropped along with the new mock's `support@stereolabs.com` /
`Location: India` — none of these were ever real. Copyright is now a
real, generic "© 2026 Venturo. All rights reserved." If Venturo has a
real support email, phone, or address to publish, this is where it goes.

## ~~Mobile hero copy spacing is looser than the `mob 01` frame~~ — RESOLVED

**Fixed.** Pulled the real Figma anchors directly from both hero nodes
(desktop `5:15`, mobile `7:144`) rather than reusing the desktop-derived
27/50/40/60px margins on mobile. For each of the four copy-block margins,
computed the real value as `(next element's top) - (previous element's
top + previous element's actual rendered line-box height)` at both
breakpoints, then converted to a `clamp()` matching the existing
`--vt-gutter`/`--vt-h1-size` two-anchor pattern (desktop anchor unchanged
at 27/50/40/60px — already shipped/approved; mobile anchor newly derived
at 25/10/20/50px):

```css
.hm-hero-discount { margin-top: clamp(25px, 0.131vw + 24.49px, 27px); }
.hm-hero-title     { margin: clamp(10px, 2.614vw - 0.2px, 50px) 0 0 0; }
.hm-hero-sub        { margin-top: clamp(20px, 1.307vw + 14.9px, 40px); }
.hm-shop-now         { margin-top: clamp(50px, 0.654vw + 47.45px, 60px); }
```

Two more contributors were found and fixed along the way — both
mobile-only values (no desktop equivalent to interpolate against, so left
as plain fixed values rather than clamps), also invented rather than
measured, also contributing to the overshoot: the gap between the image
panel's bottom edge and the "Hot Deals" eyebrow (`.hm-hero-copy`
margin-top, was `40px`, real value `29px` — the real gap in `mob 01`) and
a bottom padding after "Shop Now" (`.hm-hero-inner` padding-bottom, was
`56px`; the real frame has **zero** space after the button — the button's
own bottom edge lands exactly at the hero's bottom edge). Fixed to `0`.

Live-verified: mobile hero height is now **756px** against the Figma
frame's **748.07px** — a ~1% residual gap (browser font-metric rounding
against Figma's declared leading, not a measurement error) versus the
previous 895px/~20% overshoot. Desktop hero height unaffected (still
governed by `--vt-hero-height`, untouched by this fix) — confirmed via
screenshot at 1920/1536/1440/390 plus the real 1440×719 window, no visual
regression at any width.

## `CI=true npm run build` fails on pre-existing ESLint warnings

Plain `npm run build` succeeds (exit 0) and is what this repo's documented
workflow uses. But most CI platforms set `CI=true` automatically (per
Create React App's own behavior — "Treating warnings as errors because
process.env.CI = true"), which means **a real CI pipeline run against this
repo, as it stands today, would fail the build** — not a false alarm.
None of these were introduced by the Phase 0 session that found them; they
predate it. Flagging as a real deploy-time risk to resolve before this
repo is wired into any CI pipeline, not a cosmetic backlog item.

**65 warnings across 23 files**, verbatim from the `CI=true npm run build`
run:

### `src/app/App.tsx`
```
Line 3:10:   'Link' is defined but never used    @typescript-eslint/no-unused-vars
Line 3:23:   'Router' is defined but never used  @typescript-eslint/no-unused-vars
Line 21:10:  'T' is defined but never used       @typescript-eslint/no-unused-vars
```

### `src/app/MaterialTheme/index.ts`
```
Line 5:10:  'maxWidth' is defined but never used  @typescript-eslint/no-unused-vars
```

### `src/app/MaterialTheme/shadow.ts`
```
Line 1:1:  Assign array to a variable before exporting as module default  import/no-anonymous-default-export
```

### `src/app/MaterialTheme/typography.ts`
```
Line 1:1:  Assign object to a variable before exporting as module default  import/no-anonymous-default-export
```

### `src/app/components/footer/index.tsx`
```
Line 23:15:  img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
Line 30:15:  img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
Line 31:15:  img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
Line 32:15:  img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
Line 33:15:  img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
```

### `src/app/components/headers/Basket.tsx`
```
Line 84:11:   img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
Line 150:21:  img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
```

### `src/app/components/headers/HomeNavbar.tsx`
```
Line 4:17:    'useEffect' is defined but never used                                                                  @typescript-eslint/no-unused-vars
Line 4:28:    'useState' is defined but never used                                                                   @typescript-eslint/no-unused-vars
Line 48:15:   img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
Line 101:15:  img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
Line 101:15:  The attribute aria-haspopup is not supported by the role img. This role is implicit on the element img  jsx-a11y/role-supports-aria-props
```

### `src/app/components/headers/OtherNavbar.tsx`
```
Line 39:5:    'setSignupOpen' is assigned a value but never used                                                      @typescript-eslint/no-unused-vars
Line 54:15:   img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
Line 105:15:  img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
Line 105:15:  The attribute aria-haspopup is not supported by the role img. This role is implicit on the element img  jsx-a11y/role-supports-aria-props
```

### `src/app/context/ContextProvider.tsx`
```
Line 5:8:  'exp' is defined but never used  @typescript-eslint/no-unused-vars
```
(This is the stray `import exp from "constants";` — an accidental editor
auto-import, already flagged in `BURAK_REACT_AUDIT.md` §4.1 item 4.)

### `src/app/screens/homePage/ActiveUsers.tsx`
```
Line 10:10:  'ProductCollection' is defined but never used  @typescript-eslint/no-unused-vars
```

### `src/app/screens/homePage/Events.tsx`
```
Line 38:19:  img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
Line 46:27:  img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
Line 55:27:  img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
Line 59:27:  img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
Line 71:11:  img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
Line 76:11:  img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
```

### `src/app/screens/homePage/NewDishes.tsx`
```
Line 15:10:  'ProductCollection' is defined but never used  @typescript-eslint/no-unused-vars
```

### `src/app/screens/homePage/PopularDishes.tsx`
```
Line 16:10:  'ProductCollection' is defined but never used  @typescript-eslint/no-unused-vars
```

### `src/app/screens/homePage/index.tsx`
```
Line 59:6:  React Hook useEffect has missing dependencies: 'setNewDishes', 'setPopularDishes', and 'setTopUsers'. Either include them or remove the dependency array  react-hooks/exhaustive-deps
```

### `src/app/screens/ordersPage/FinishedOrders.tsx`
```
Line 3:8:    'Button' is defined but never used                                                                  @typescript-eslint/no-unused-vars
Line 5:8:    'moment' is defined but never used                                                                  @typescript-eslint/no-unused-vars
Line 36:23:  img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
Line 40:25:  img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
Line 42:25:  img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
Line 87:15:  img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
```

### `src/app/screens/ordersPage/PausedOrders.tsx`
```
Line 104:23:  img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
Line 108:25:  img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
Line 110:25:  img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
Line 124:19:  img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
Line 127:19:  img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
Line 162:15:  img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
```

### `src/app/screens/ordersPage/ProcessOrders.tsx`
```
Line 80:23:   img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
Line 84:25:   img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
Line 86:25:   img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
Line 100:19:  img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
Line 103:19:  img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
Line 132:15:  img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
```

### `src/app/screens/ordersPage/index.tsx`
```
Line 36:24:   'setOrderInquiry' is assigned a value but never used                                                                                                        @typescript-eslint/no-unused-vars
Line 59:6:    React Hook useEffect has missing dependencies: 'setPausedOrders', 'setProccessOrders', and 'setTFinishedOrders'. Either include them or remove the dependency array  react-hooks/exhaustive-deps
Line 102:15:  img elements must have an alt prop, either with meaningful text, or an empty string for decorative images                                                   jsx-a11y/alt-text
```

### `src/app/screens/productsPage/ChosenProduct.tsx`
```
Line 64:6:   React Hook useEffect has missing dependencies: 'productsId', 'setChosenProduct', and 'setRestaurant'. Either include them or remove the dependency array  react-hooks/exhaustive-deps
Line 83:19:  img elements must have an alt prop, either with meaningful text, or an empty string for decorative images                                        jsx-a11y/alt-text
```

### `src/app/screens/productsPage/Products.tsx`
```
Line 5:3:     'Card' is defined but never used                                                                       @typescript-eslint/no-unused-vars
Line 21:10:   'setRestaurant' is defined but never used                                                              @typescript-eslint/no-unused-vars
Line 21:25:   'setChosenProduct' is defined but never used                                                           @typescript-eslint/no-unused-vars
Line 65:6:    React Hook useEffect has a missing dependency: 'setProducts'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
Line 414:13:  <iframe> elements must have a unique title property                                                    jsx-a11y/iframe-has-title
```

### `src/app/screens/productsPage/index.tsx`
```
Line 3:10:  'Container' is defined but never used  @typescript-eslint/no-unused-vars
```

### `src/app/screens/userPage/Settings.tsx`
```
Line 95:9:  img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
```

### `src/app/screens/userPage/index.tsx`
```
Line 39:19:  img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
Line 48:21:  img elements must have an alt prop, either with meaningful text, or an empty string for decorative images  jsx-a11y/alt-text
```

**Breakdown by rule** (for judging severity/effort): 38 `jsx-a11y/alt-text`
(every `<img>` missing an `alt` prop — mechanical, same fix pattern
repeated), 15 `@typescript-eslint/no-unused-vars` (dead imports/vars —
mechanical), 5 `react-hooks/exhaustive-deps` (missing `useEffect`
dependencies — needs actual judgment per call site, not purely mechanical;
some are likely intentional "run once" effects where adding the deps would
change behavior, not just silence the linter), 2
`jsx-a11y/role-supports-aria-props` (both on the same repeated
`aria-haspopup` on an `<img>` in `HomeNavbar.tsx`/`OtherNavbar.tsx`), 2
`import/no-anonymous-default-export`, 1 `jsx-a11y/iframe-has-title`.

Not fixed as part of Phase 0 — out of that phase's scope (contract/config
fixes only). Worth a dedicated small cleanup pass before any CI pipeline
is wired up, separate from the phase-by-phase reskin work.

## Visual pass — not yet done

This session's functional-only pass (Phases 0–6) deliberately skipped all
CSS/theming, copy, and brand-asset work, per explicit instruction — a
separate later session with design skills loaded handles this. Per
AGENTS.md, `burak.svg`/`burak-ads.mp4` references are untouched
deliberately (no Venturo replacement asset exists yet) and no replacement
copy was invented.

### Phase 1 — Homepage
- `HomeNavbar.tsx`: hero copy ("World's Most Delicious Cousine", "The
  Choice, not just a choice", "24 hours service"), brand-logo `src`
  (`/icons/burak.svg`)
- `Statistics.tsx`: hardcoded stats + labels ("Restaurants: 12", "Menu:
  50+", etc.)
- `Advertisement.tsx`: video ad (`video/burak-ads.mp4`)
- `ActiveUsers.tsx`, `Events.tsx`: remaining food-domain copy, if any
  (functional bug in `ActiveUsers.tsx` already fixed separately — see
  `docs/ai/COMPLETED_TASKS.md`)
- `lib/data/plans.ts`: events copy ("Hot Discount Days", "Chef Deming",
  "New Restaurant is opening in Florida") consumed by `Events.tsx`

### Phase 2 — Products list
- `src/css/products.css` and card/grid imagery: full re-theme for the
  outdoor-gear look
- `Products.tsx`'s "Our Family Brands" section (lines ~392–408): four
  Burak-branded images (`gurme.webp`, `seafood.webp`, `sweets.webp`,
  `doner.webp`) and heading — food-domain content with no clear outdoor-gear
  equivalent decided yet; not part of the original migration-plan text for
  this phase, flagging now that it was found
- `Products.tsx`'s "Our address" section (lines ~410–425): an embedded
  Google Maps iframe pointing at a placeholder South Korea location —
  content-only, no API key/dependency involved (this is the no-key embed
  URL format, not the JS Maps API), so no blocker like the Contact Us map
  decision — just needs real content or a decision to remove it

### Phase 3 — Product detail
- `ChosenProduct.tsx`/`css/products.css`: full re-theme for the
  outdoor-gear look (slider/card styling, "Product Detail" heading, etc.)
- No Burak-specific hardcoded copy found in this component beyond
  generic styling — the rating hardcode was the one non-visual issue and
  is already fixed (see `docs/ai/COMPLETED_TASKS.md`)
- `reviewCount` is now on the `Product` type (added alongside
  `averageRating`) but not yet surfaced anywhere in the UI (e.g. a
  "(N reviews)" label next to the stars) — noting as available for a
  future targeted addition, not implemented since it wasn't asked for

### Phase 4 — Checkout (new page)
- `src/app/screens/checkoutPage/index.tsx`: brand-new page, currently
  unstyled beyond MUI component defaults (no custom CSS file was created,
  deliberately — this pass is functional-only) — needs the full design
  treatment a real page gets: layout, spacing, imagery, and a decision on
  whether the address-field labels/copy need anything beyond the generic
  Street/City/State/Zip/Country used here
- The broken product-image icons visible on this page for `qa_`-tagged
  test products are expected (those synthetic products have empty
  `productImages` arrays — no real images were uploaded for test data),
  not a checkout bug; will resolve naturally once real product images
  exist

### Phase 5 — Orders/Account
- `ordersPage/*`, `userPage/Settings.tsx`, `css/order.css`/`userPage.css`:
  full re-theme, unchanged from the original migration audit
- `PausedOrders.tsx` — the file itself, and its internal identifiers
  (`pausedOrders`, `setPausedOrders`, `retrievePausedOrders`, the
  `state.pausedOrders` slice key) still say "Paused" even though the
  *visible* tab label was corrected to "Pending Orders" — an internal
  naming-only inconsistency, deliberately not touched this pass since it
  would require coordinated edits across the component file, `slice.ts`,
  `selector.ts`, and `ordersPage/index.tsx`'s import all at once for zero
  user-facing benefit. Worth doing next time this area is touched for
  other reasons, not on its own.

### Phase 6 — Help Page
- `helpPage/*`, `css/help.css`: FAQ/Terms copy and all styling —
  untouched, visual-pass work
- The Contact form now has a required **Subject** field that didn't
  exist before (added out of functional necessity — the backend schema
  requires it) — its placement/styling is currently just inserted between
  the existing Email and Message fields using the same markup pattern;
  worth a look during the visual pass to make sure it reads naturally in
  the final layout, not just functionally present

## `ActiveUsers.tsx` restyle — resolved

The "`ActiveUsers.tsx` needs a HikMali-consistent restyle" item above
(and the `'ProductCollection' is defined but never used` ESLint flag for
this file, listed in the ESLint warnings section further down) are both
resolved — see `docs/ai/COMPLETED_TASKS.md` for the full writeup.
Left the original entries above in place per this doc's append-only
convention rather than deleting them.

## `Highlights.tsx`'s heading is clipped at 1440px width

Discovered while re-measuring contrast during the Highlights photo
re-source session (see `docs/ai/COMPLETED_TASKS.md`). `.hl-heading` has
a fixed `top: 595px`, but `.highlights` itself is `aspect-ratio: 2.4`
(fluid height = width ÷ 2.4) — at 1920 that's 800px tall (heading fits
comfortably), but at 1440 it's only 600px tall, so the heading
(595–627px) is almost entirely clipped by `.highlights`' own
`overflow: hidden`, leaving only a ~5px sliver visible. Unrelated to
either photo used in this section — a scrim can't fix clipping. Not
fixed in that session (out of scope for a photo re-source). Likely fix:
size `.hl-heading`'s `top` proportionally (a `%` value, or a fluid
`--vt-*` token) instead of a fixed px anchored to the 1920 frame — same
class of fix already used elsewhere for fluid positioning.
