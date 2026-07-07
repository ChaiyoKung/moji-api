# Contract: System Prompt — Ignore Note When Same as Category Name

## Change Scope

Only the `systemPrompt` string inside `autoCreate()` in
`src/transactions/transactions.service.ts` is modified.
No TypeScript logic changes.

## New Rule to Add to System Prompt

Add the following rule to the existing `note:` rule line or as a dedicated note section:

```
- note: short 1-line description of the specific line item; set to null if the note text contains the matched category name (case-insensitive substring match — e.g. category "Food" and note "food" or "food expenses" → null)
```

The existing `note` rule currently reads:
```
- note: short 1-line description of the specific line item
```

Replace it with the expanded rule above.

## AI Response Schema (unchanged)

The existing `aiResponseSchema` / `aiItemSchema` in the service is **not modified**.
`note` is already typed as `string | null`.

```ts
// unchanged
{
  items: Array<{
    type: "income" | "expense";
    amount: number | null;
    date: string | null;
    note: string | null;   // null when note contains matched category name (case-insensitive)
    categoryId: string;
  }>
}
```

## Matching Rule

| note (AI candidate) | category name | result |
|---------------------|---------------|--------|
| `"food"` | `"Food"` | `null` (exact, case-insensitive) |
| `"food expenses"` | `"Food"` | `null` (category name is substring of note) |
| `"lunch at café"` | `"Food"` | keep as-is (no match) |
| `"transport fee"` | `"Transport"` | `null` (substring match) |
| `"coffee"` | `"Food"` | keep as-is (no match) |

## Unit Test Contract

File: `src/transactions/transactions.service.spec.ts`

Add test cases that mock the AI returning a note equal to or containing the category name,
and assert the created transaction has `note` undefined/omitted.

| Mock AI note | Category name | Expected transaction note |
|-------------|---------------|--------------------------|
| `"food"` | `"Food"` | `undefined` (field omitted) |
| `"food expenses"` | `"Food"` | `undefined` (field omitted) |
| `"lunch at café"` | `"Food"` | `"lunch at café"` (kept) |
