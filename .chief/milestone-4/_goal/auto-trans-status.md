# Goal: Auto-Transaction Status from Client

## Summary
Allow the client to specify `status` when calling `POST /transactions/auto`. Currently hardcoded to `"draft"`.

## Goals

### G1 — Accept status from client on auto-create
Add optional `status?: "draft" | "confirmed"` to `AutoTransactionDto` in `src/transactions/dto/auto-transaction.dto.ts`, validated with `@IsEnum(["draft", "confirmed"])`. If omitted, defaults to `"draft"`.

### G2 — Pass status through to transaction creation
Replace the hardcoded `status: "draft"` in `autoCreate()` in `src/transactions/transactions.service.ts` with `dto.status ?? "draft"`, so the client-supplied value flows through to each created transaction.

### G3 — Unit test coverage
Update `src/transactions/transactions.service.spec.ts` to assert:
- (a) Omitting `status` produces transactions with `status: "draft"`
- (b) Passing `status: "confirmed"` produces transactions with `status: "confirmed"`

## Out of Scope
- No changes to the update endpoint or schema.
- No changes to balance logic (existing `insertTransactionWithBalanceUpdate` handles confirmed status already).
