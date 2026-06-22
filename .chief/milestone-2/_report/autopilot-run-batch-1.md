# Autopilot Run Batch 1

## Mode
auto

## Summary
Extended `POST /transactions/auto` to support multi-item extraction from a single receipt. AI now returns `{ "items": [...] }` in one call. Each item is processed independently. Valid items are created as draft transactions; failed items are reported with a 1-based `item` number and `reason`. Response shape is `{ created, failed }` with HTTP `207`.

## Tasks Completed
- task-1: Updated `autoCreate()` in `TransactionsService` — new `aiItemSchema` + `aiResponseSchema` wrapping an array, per-item loop with independent validation, partial failure collection, `207` on success, `422` when all fail or empty array
- task-2: Updated `POST /transactions/auto` controller — added `@HttpCode(207)` decorator
- task-3: Updated unit tests — 10 tests covering single-item, multi-item, partial failure, all-fail `422`, empty `422`, date/amount/note fallbacks per item, Zod parse error

## Decisions Made (auto mode only)
None — all decisions were made during the `/chief-plan` grill session before implementation.

## Backlog
None — all milestone goals met.

## User Action Needed
None.
