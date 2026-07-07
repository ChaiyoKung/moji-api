# Milestone 6 — Ignore Note When Same as Category Name

## Tasks

- [x] task-1: Update system prompt — replace the `note` rule line in `systemPrompt` inside `autoCreate()` in `src/transactions/transactions.service.ts` to add the case-insensitive substring rule (return `null` if note contains category name)
- [x] task-2: Add unit tests — add test cases in `src/transactions/transactions.service.spec.ts` mocking AI responses where note equals or contains the category name, asserting the transaction is created with the note field omitted
