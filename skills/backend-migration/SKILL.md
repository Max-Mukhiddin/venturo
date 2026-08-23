---
name: backend-migration
description: Continue the Venturo backend migration from Burak food-ordering concepts to Venturo adventure-gear e-commerce concepts while preserving the existing Express/Mongoose architecture.
---

# Venturo Backend Migration

Use this skill when changing backend code for the Venturo product migration.

## Workflow

1. Search for affected restaurant/food or product references before editing.
2. Preserve the controller/service/schema structure already used in this
   repo (src/controllers, src/models/*.service.ts, src/schema).
3. Keep enums and types in their existing folders (src/libs/enums,
   src/libs/types).
4. Keep `MemberType.USER | ADMIN` unchanged — this system is single-tenant
   by design.
5. Use Venturo/product terminology for catalog behavior and database
   lookups, never food/restaurant terms.
6. Update related entities consistently when product counters are
   involved — View, Wishlist, and Review all reference productId the same
   way, so a change to one's product-lookup pattern likely needs the same
   fix in the others.
7. Update docs/COMPLETED_TASKS.md after major completed work.
8. Run `npx tsc --noEmit` before considering any change done.