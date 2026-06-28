# Goal: Multi-Item AI Auto Transaction

## Summary
Extend `POST /transactions/auto` to support extracting and creating **multiple draft transactions** from a single receipt image or text. The AI returns an array of items in one call. Each item is independent. Partial failures are tolerated — valid items are created, failed items are reported.

## Goals

### G1 — AI returns array of items in one call
Modify the AI prompt and Zod schema so the AI returns a wrapper object `{ "items": [...] }` where each item contains:
- `type` — `"income"` or `"expense"`
- `amount` — number or `null`
- `date` — `"YYYY-MM-DD"` or `null`
- `note` — string or `null`
- `categoryId` — string (must be non-null, must match a category in the user's list)

If the AI returns an empty `items` array → respond `422 Unprocessable Entity`.

### G2 — Per-item validation
Each item is validated independently:
- `categoryId` must be non-null and must match a category in the user's category list.
- If an item fails validation, it is added to the `failed` list with a 1-based `item` number and `reason` string.
- Valid items proceed to creation.

### G3 — Multiple draft transaction creation
Create one `status: "draft"` transaction per valid item using the existing `TransactionsService.create()` flow. Each item is fully independent (`type`, `amount`, `note`, `categoryId`, `date`). Shared fields from the request: `accountId`, `currency`, `timezone`.

### G4 — Partial failure response
The endpoint always returns:
```json
{
  "created": [ /* Transaction documents */ ],
  "failed": [
    { "item": 2, "reason": "AI returned a categoryId that does not match any of the user's categories" }
  ]
}
```
- HTTP `207 Multi-Status` when at least one transaction is created.
- HTTP `422 Unprocessable Entity` when all items fail OR AI returns empty array.

### G5 — Time-aware meal category disambiguation
When `POST /transactions/auto` receives ambiguous food text or images without an explicit meal-time clue, the AI prompt must include the user's current local date/time derived from the request timezone and instruct the model to use it for meal-based category selection.

- If the text/image explicitly indicates a meal time, that explicit clue wins.
- If the text/image is ambiguous and meal categories differ only by meal period, the AI must choose based on the user's current local time using these windows:
  - breakfast: `05:00-11:59`
  - lunch: `12:00-16:59`
  - dinner: `17:00-23:59`
- If the user's current local time is `00:00-04:59`, the AI must avoid meal-based disambiguation and fall back to the closest non-meal clue.

## Out of Scope
- No changes to `PUT /transactions/:id` or any other endpoint.
- No new module — still lives inside `TransactionsModule`.
- No UI confirmation step — draft creation is immediate.
