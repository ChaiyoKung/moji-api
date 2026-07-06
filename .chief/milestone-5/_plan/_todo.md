# Milestone 5 — Quantity Expansion in Auto Transaction System Prompt

## Tasks

- [x] task-1: Add quantity expansion rules to system prompt — insert the "Quantity expansion rules" block into the `systemPrompt` string in `autoCreate()` in `src/transactions/transactions.service.ts`
- [x] task-2: Update unit tests — add test cases in `src/transactions/transactions.service.spec.ts` to assert that `cola x2 50 thb` produces 2 transactions at 25 thb each, and `donus x3 90 thb` produces 3 at 30 thb each (mock AI response accordingly)
