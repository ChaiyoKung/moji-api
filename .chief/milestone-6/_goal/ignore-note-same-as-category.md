# Goal: Suppress Redundant Note When It Matches Category Name

## Problem

When the AI extracts a transaction, it sometimes returns a `note` that is identical to
(or just contains) the category name — e.g., category `"Food"` and note `"food"`.
This is redundant and clutters the transaction record.

## Goal

Update the AI system prompt in `autoCreate()` so the AI returns `note: null` whenever
the note text would merely repeat or contain the matched category name.

## Success Criteria

1. Input that maps to category `"Food"` with a note of `"food"` → AI returns `note: null`
2. Input that maps to category `"Food"` with a note of `"food expenses"` → AI returns `note: null` (substring match)
3. Input that maps to category `"Food"` with a note of `"lunch at café"` → AI returns the note as-is (not a match)
4. Matching is case-insensitive (`"Food"` matches `"food"`, `"FOOD"`, `"Food expenses"`)
5. No TypeScript/backend logic changes — rule is enforced purely via the system prompt

## Scope

- **Only change:** system prompt string in `src/transactions/transactions.service.ts`
- Unit tests added in `src/transactions/transactions.service.spec.ts` to verify the rule is respected via mocked AI responses
