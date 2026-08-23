# Venturo Backend — Agent Instructions

## What this project is
Venturo is a single-tenant e-commerce backend for an adventure/outdoor-equipment
store. It was migrated from a food-ordering template called "Burak" (a
single-restaurant ordering app) — same architecture, different business domain.
Full migration findings live in VENTURO_AUDIT.md; treat that as historical
ground truth, not this file.

## Stack
- Express 4 + TypeScript (strict)
- MongoDB via Mongoose 6
- REST API (no GraphQL/Apollo anywhere) at "/", server-rendered EJS admin
  panel at "/admin"
- Two auth mechanisms: JWT (REST API, cookie accessToken) and
  express-session + MongoDB store (admin panel)
- No customer-facing frontend lives in this repo — that's venturo-react,
  a separate project

## Folder map
- src/controllers — route handlers
- src/models — *.service.ts business logic (NOT Mongoose schemas)
- src/schema — Mongoose schemas
- src/libs/enums, src/libs/types — shared enums/types
- src/views — EJS templates (admin panel only)

## Domain model (current, post-migration)
- Member: memberType is USER | ADMIN (was RESTAURANT)
- Product: productCollection is CLIMBING/CAMPING/HIKING/TREKKING/CYCLING/
  APPAREL/FOOTWEAR/OTHER (was food categories). ProductVolume was removed
  entirely — don't reintroduce it. productSize is optional.
- Order / OrderItem / View — unchanged in shape from the original template

## Rules for this repo
- Single-tenant by design (one ADMIN account per deployment) — don't
  "fix" that assumption without asking first.
- Don't bump major dependency versions unless something is actually
  broken. If you must, say exactly what forced it before continuing.
- Run `npx tsc --noEmit` after any change before considering it done.
- Keep changes scoped to what was asked.
- Known open items: no admin-side order management view yet; DELETE
  status is soft-delete only.
