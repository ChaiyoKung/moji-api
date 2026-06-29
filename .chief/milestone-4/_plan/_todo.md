# Milestone 4 — Auto-Transaction Status from Client

## Tasks

- [ ] task-1: Add `status` field to `AutoTransactionDto` — add optional `@IsEnum(["draft", "confirmed"])` `status` field in `src/transactions/dto/auto-transaction.dto.ts`
- [ ] task-2: Replace hardcoded `status: "draft"` in `autoCreate()` — use `dto.status ?? "draft"` in `src/transactions/transactions.service.ts`
- [ ] task-3: Update unit tests — add/update test cases in `src/transactions/transactions.service.spec.ts` to assert default `"draft"` and explicit `"confirmed"` passthrough
