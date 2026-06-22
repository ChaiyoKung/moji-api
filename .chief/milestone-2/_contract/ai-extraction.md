# Contract: AI Extraction (multi-item)

## OpenAI SDK Configuration

Unchanged from milestone 1 — `OPENAI_BASE_URL`, `OPENAI_API_KEY`, `OPENAI_MODEL` via `ConfigService`.

## AI Prompt Changes

The system prompt must instruct the AI to extract **all line items** from the receipt/text as an array.

### System Prompt Structure

```
You are a financial transaction extractor. Analyze the provided receipt image and/or text description and extract ALL transaction line items.

Available categories (pick the best matching _id for each item):
<categories JSON>

Respond with ONLY a JSON object in this exact format:
{
  "items": [
    {
      "type": "income" or "expense",
      "amount": number or null,
      "date": "YYYY-MM-DD" or null,
      "note": "short description" or null,
      "categoryId": "_id from the categories list above"
    }
  ]
}

Rules:
- Extract every distinct line item as a separate entry in "items".
- type: "expense" for purchases/payments, "income" for salary/refund/income.
- amount: the line item amount as a number, null if unclear.
- date: the transaction date in YYYY-MM-DD format, null if not found (all items may share the same receipt date).
- note: a short 1-line description of the specific line item.
- categoryId: pick the _id of the most relevant category from the list. Must be a valid _id from the list.
```

## AI Response Zod Schema

```ts
const aiItemSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().nullable(),
  date: z.string().nullable(),
  note: z.string().nullable(),
  categoryId: z.string(),
});

const aiResponseSchema = z.object({
  items: z.array(aiItemSchema),
});
```

## Validation Rules (per item)

1. Run `aiResponseSchema.safeParse()` on the full response. If it fails → `422` (unrecoverable).
2. For each item, validate `categoryId` exists in the user's category list. If not → add to `failed`.
3. If `date` is null → fall back to today's date in `dto.timezone` formatted as `"YYYY-MM-DD"`.
4. If `amount` is null → omit `amount` field from `CreateTransactionDto`.
5. If `note` is null → omit `note` field from `CreateTransactionDto`.

## Empty Items Rule

If `items` array is empty after Zod parse → throw `UnprocessableEntityException("AI returned no items")`.

## Partial Failure Rule

- Process all items regardless of individual failures.
- Collect `{ item: <1-based index>, reason: string }` for each failed item.
- Create transactions only for valid items.
- If `created.length === 0` → throw `UnprocessableEntityException` with `failed` list.
- If `created.length > 0` → return `{ created, failed }` with HTTP `207`.
