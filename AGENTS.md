# Venturo Backend Agent Instructions

Venturo is a single-tenant Express/TypeScript/Mongoose REST backend migrated
from a food-ordering template called "Burak" into an adventure/outdoor-
equipment e-commerce platform.

## Read First
Before changing code, read the current AI handoff docs:
- docs/ai/BACKEND_MIGRATION.md
- docs/ai/DECISIONS.md
- docs/ai/COMPLETED_TASKS.md
- docs/ai/NEXT_STEPS.md
- VENTURO_ER_MODEL.md

Use those files as the source of truth for migration history, accepted
decisions, remaining work, and validation status.

## Project Shape
- Single Express app, not a monorepo — REST API at "/", server-rendered
  EJS admin panel at "/admin"
- Keep the existing controller/service/schema pattern (src/controllers,
  src/models/*.service.ts, src/schema)
- Keep enums/types under src/libs
- Single-tenant by design — one ADMIN member per deployment, don't change
  this without asking first

## Domain Rules
- Use Venturo/product terminology for the main catalog entity, never
  "dish" or "restaurant"
- Do not reintroduce food/restaurant fields (ProductVolume,
  DISH/SALAD/DESSERT/DRINK)
- Keep MemberType.USER and MemberType.ADMIN unchanged
- Product enum values are:
  - ProductCollection: CLIMBING, CAMPING, HIKING, TREKKING, CYCLING,
    APPAREL, FOOTWEAR, OTHER
  - ProductSize: SMALL, NORMAL, LARGE, SET (optional field)
- Confirmed new entities (see VENTURO_ER_MODEL.md for full reasoning):
  - Wishlist: memberId + productId, unique compound index
  - Article: admin-authored blog content (title, slug, content, category,
    status)
  - ContactMessage: persisted contact-form submissions
  - Review: memberId + productId + rating(1-5) + comment; Product gets
    cached averageRating/reviewCount fields
- Order gets a frozen shippingAddress snapshot at creation time — never
  live-linked to Member's current address
- OrderStatus extends to: PENDING, PROCESS, SHIPPED, FINISH, DELETE
- FAQ stays static (frontend-only), not database-backed, for launch

## Workflow
1. Analyze before editing.
2. Keep changes small and scoped — one numbered task at a time.
3. Do not remove working logic unless replaced safely.
4. Update docs/COMPLETED_TASKS.md after each completed pass.
5. Run npx tsc --noEmit after every change.

## Validation
Use these checks for backend work:

npx tsc --noEmit
npm run build   (confirm a build script actually exists first)

Never run a lint/format command with --fix without checking what it
changes first.