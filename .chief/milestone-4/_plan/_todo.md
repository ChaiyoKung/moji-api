# Milestone 4 — Auto-Transaction Status from Client

## Tasks

- [x] task-1: Add `status` field to `AutoTransactionDto` — add optional `@IsEnum(["draft", "confirmed"])` `status` field in `src/transactions/dto/auto-transaction.dto.ts`
- [x] task-2: Replace hardcoded `status: "draft"` in `autoCreate()` — use `dto.status ?? "draft"` in `src/transactions/transactions.service.ts`
- [x] task-3: Update unit tests — add/update test cases in `src/transactions/transactions.service.spec.ts` to assert default `"draft"` and explicit `"confirmed"` passthrough
- [x] task-4: Fix MongoDB write conflict in `autoCreate()` — replace `Promise.allSettled` parallel execution with sequential `for...of` loop to prevent concurrent writes to the same account document
- [x] task-5: Replace O(n) `categories.some()` with O(1) `Set` lookup in `autoCreate()` — build a `Set<string>` of category IDs once before the loop, then use `categoryIdSet.has(item.categoryId)` instead of `categories.some(...)` per iteration
