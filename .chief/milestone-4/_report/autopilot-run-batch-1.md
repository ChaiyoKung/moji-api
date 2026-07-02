# Autopilot Run Batch 1

## Mode
auto

## Summary
All milestone-4 goals were already implemented (tasks 1–3). The autopilot run identified and fixed an additional MongoDB write conflict bug in `autoCreate()` caused by concurrent session writes to the same account document (task 4). All 15 unit tests pass.

## Tasks Completed
- task-1: `status` field already present in `AutoTransactionDto` with `@IsEnum(["draft", "confirmed"])` validation — no change needed.
- task-2: `dto.status ?? "draft"` already in place in `autoCreate()` — no change needed.
- task-3: Unit tests for status passthrough already present and passing — no change needed.
- task-4: Replaced `Promise.allSettled(items.map(...))` with a sequential `for...of` loop in `autoCreate()` to eliminate `WriteConflict` errors when multiple confirmed transactions update the same account balance concurrently.

## Decisions Made (auto mode only)
- **Issue:** `autoCreate()` used `Promise.allSettled` to create all AI-extracted items in parallel. When `status: "confirmed"`, each create opens a MongoDB session and writes to the same account document simultaneously, causing `WriteConflict: Write conflict during plan execution and yielding is disabled`.
- **Options:** (a) Sequential execution via `for...of`; (b) Merge all items into a single `createMany()` transaction.
- **Chosen:** Sequential `for...of` with per-item settled result accumulation (matching existing `Promise.allSettled` semantics — partial failures still reported).
- **Reason:** Minimal change, preserves partial-failure reporting behavior, and avoids restructuring the `createMany` path which would require larger contract changes.

## Backlog
None — all milestone goals met.

## User Action Needed
None.
