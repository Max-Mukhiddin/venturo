# Prompts — Venturo Sessions

Two parts: prompts that were actually used in this repo's sessions and worked well (with why), and reusable templates for the tasks identified in [NEXT_STEPS.md](NEXT_STEPS.md).

## Prompts actually used in this repo, and why they worked

| # | Prompt (summarized) | Why it worked |
|---|---|---|
| 1 | *"Audit an existing codebase... structured investigation only, work in this order: structure first, find what was renamed, map the domain model, assess completion state, frontend flow, then write findings to VENTURO_AUDIT.md and stop for review."* | Explicitly forbade code changes and forbade guessing ("do not skip ambiguous cases by guessing — list them as open questions instead"). The numbered, ordered sections meant the audit built up context progressively instead of jumping to conclusions, and the hard "stop after writing the file" boundary meant investigation and action stayed separate turns. |
| 2 | *"Continue from VENTURO_AUDIT.md. Fix these confirmed bugs: [explicit list]. Remove dead code: [explicit list]. Apply this rename: [explicit list]. Update wording: [explicit list]. Run tsc --noEmit after each section before moving to the next. List every file touched and stop for review."* | Every change was named explicitly (no "and clean up anything else you notice") with an enumerated list per section, and validation was required as a gate between sections rather than at the end — this is what made it possible to isolate scope and catch problems section-by-section instead of debugging one large diff. |
| 3 | *"Document the current ER model, then propose what's needed for the storefront. Do NOT change any code. For each new page/feature, assess: does the schema already support it, does it need new fields, or does it need a new entity? Separate technical findings from product decisions in an Open Questions section."* | Separating "what exists" (verified against actual schema/service code) from "what's proposed" (clearly labeled, not implemented) from "what's undecided" (explicit product questions) prevented the output from quietly smuggling assumptions in as facts. |
| 4 | *"[Documentation request] reference VENTURO_AUDIT.md, VENTURO_ER_MODEL.md, AGENTS.md, and your own prior actions in this repo as source material — don't invent anything not grounded in those."* | Explicitly naming the source-of-truth documents (rather than "summarize what we did") made it possible to verify every claim against a specific file or git diff instead of relying on conversational memory alone. |

### A cautionary example (not a template to reuse)

A near-identical documentation request was sent once using a different project's terminology (a NestJS/GraphQL/Next.js stack with different naming) that didn't match this repository at all. It was caught by grepping the repo for the unfamiliar terms *before* writing anything, and the task was paused rather than generating documentation full of fabricated details. **Lesson**: when a prompt references a stack, framework, or naming that doesn't match what's actually in the target repo, verify against the repo first — don't generate plausible-sounding documentation from the prompt's own template language.

## Reusable prompt templates for next tasks

### Resolving one ER-model open question and implementing it

```
Resolve open question #[N] from VENTURO_ER_MODEL.md: "[paste the exact
question text]".

My decision: [state the decision].

Given that decision:
1. Update VENTURO_ER_MODEL.md's Open Questions section to mark this resolved
   (with the decision and date), and update the ER diagram / Proposed
   Additions table if the resulting schema shape differs from what was
   proposed there.
2. Implement the schema change in src/schema/, following the existing
   pattern in [reference an existing schema file, e.g. src/schema/View.model.ts].
3. Add the corresponding TypeScript interfaces in src/libs/types/.
4. Add the service methods in src/models/[Entity].service.ts and controller
   handlers in src/controllers/, following the existing error-handling
   pattern (Errors class, HttpCode/Message enums from src/libs/Errors.ts).
5. Wire routes in src/router.ts (customer-facing) and/or src/router-admin.ts
   (admin panel) as appropriate — do not change any existing route paths.
6. Run npx tsc --noEmit after each of steps 2-5 before moving to the next.
7. Update BACKEND_MIGRATION.md's MongoDB Schema Changes table with the new
   entity/fields.

List every file touched and stop for review before wiring this into any
frontend work.
```

### Adding a new backend feature (general case)

```
Add [feature name] to the Venturo backend, following this repo's existing
architecture (see AGENTS.md for the folder map and standing rules).

Scope:
- Schema: [describe fields, or "none — reuses existing X schema"]
- Service methods needed: [list, e.g. create/list/update/delete]
- Routes: [REST path(s) under / or SSR path(s) under /admin — confirm which]
- Auth requirements: [none / verifyAuth (JWT) / verifyRestaurant-equivalent
  session check for admin]

Constraints:
- Single-tenant model stays as-is — do not add multi-tenant scoping unless
  I've explicitly asked for it.
- Don't bump any dependency versions unless something is actually broken;
  if you must, tell me exactly what forced it before continuing.
- Keep changes scoped to what's listed above — no unrelated cleanup in the
  same pass.
- Run npx tsc --noEmit before considering any step done.

List every file touched and stop for review.
```

### Scoped bug-fix / cleanup pass with a typecheck gate

```
Fix the following in [area of the codebase], one section at a time, running
npx tsc --noEmit after each section before moving to the next:

1. [bug/fix 1, stated explicitly — file + current behavior + desired behavior]
2. [bug/fix 2]
...

Do not fix anything not listed here, even if you notice it — note anything
else you find instead and I'll decide whether it's in scope.

List every file touched and stop for review.
```

### Auditing a new/unfamiliar area of the codebase

```
Audit [area/folder] in this repo. Do NOT change any code — investigation
only.

1. Map what's actually there (files, responsibilities) from the code itself,
   not from naming conventions or assumptions borrowed from similar projects.
2. Identify anything inconsistent, broken, or half-finished, with the exact
   file/line.
3. List anything you can't determine confidently as an Open Question rather
   than guessing.

Write findings to [OUTPUT_FILE].md at the project root and stop for review.
```

### Generating/updating documentation from session history

```
Update docs/[FILE].md to reflect everything completed since it was last
written. Ground every claim in: git log/git diff for this repo, and
[list the other current docs, e.g. AGENTS.md, VENTURO_AUDIT.md,
VENTURO_ER_MODEL.md, docs/COMPLETED_TASKS.md]. Don't invent anything not
verifiable from those sources — if something is unclear, note it as an
open item instead of guessing.

Do not change any application source code — documentation only.
```
