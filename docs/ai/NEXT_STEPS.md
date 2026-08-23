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

## Documentation

1. **Article and ContactMessage admin management is JSON-only** as of the product-entity implementation pass — `GET/POST /admin/article/*` and `GET/POST /admin/contact/*` exist and work, but there are no EJS templates for them (unlike `products.ejs`/`users.ejs`). A non-technical store owner cannot actually use these features through the admin panel yet; new EJS views (list + create/edit forms, matching the existing `products.ejs` pattern) are still required before this is usable end-to-end.
2. Resolve the flagged **`CLAUDE.md`/`AGENTS.md` duplication** (both exist at the repo root with identical content as of commit `9786040`) — either designate one as canonical and delete the other, or explicitly document why both are intentionally kept in sync, so future edits don't silently drift.
3. As each ER-model open question is resolved, update `VENTURO_ER_MODEL.md`'s "Open Questions" section to reflect the decision (move it from "open" to a dated resolution note) rather than leaving answered questions listed as open.
4. `BACKEND_MIGRATION.md`'s MongoDB Schema Changes table and `VENTURO_ER_MODEL.md`'s ER diagram now need updating to reflect the `Wishlist`/`Article`/`ContactMessage`/`Review` entities and the `Order.shippingAddress`/`OrderStatus` changes implemented in this pass — both currently still document the pre-storefront state only.
5. No `README.md` exists at the project root — consider whether one is needed for onboarding, separate from the AI-agent-focused `AGENTS.md`/`CLAUDE.md` instruction files.
