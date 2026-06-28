# Contract: AI Extraction

## OpenAI SDK Configuration

| Config Key              | Env Var                  | Description |
|-------------------------|--------------------------|-------------|
| Base URL                | `OPENAI_BASE_URL`        | Custom OpenAI-compatible base URL |
| API Key                 | `OPENAI_API_KEY`         | API key for authentication |
| Model                   | `OPENAI_MODEL`           | Model name to use (e.g. `"gpt-4o"`) |

All three are required. The `ConfigService` loads them via `@nestjs/config`.

## AI Prompt Input

Send to the AI in a single request:
1. **System prompt** — instructs the AI to extract transaction fields and match a category.
2. **User categories** — passed as a JSON array: `[{ "_id": "...", "name": "Food", "type": "expense" }, ...]`
3. **Text input** — if provided by the client.
4. **Image input** — if provided by the client (as base64 data URL in the message content).

## AI Extracted Output (JSON schema)

The AI must respond with a JSON object conforming to:

```ts
{
  type: "income" | "expense";        // required — inferred from context
  amount: number | null;             // null if not confident
  date: string | null;               // "YYYY-MM-DD" format, null if not found
  note: string | null;               // short description, null if none
  categoryId: string | null;         // _id from the provided category list, null if no match
}
```

## Category Matching Rules

1. Fetch all categories for the user: `{ $or: [{ userId: null }, { userId }] }` (system + user categories).
2. Pass the full list to the AI as context.
3. AI selects the `_id` of the best matching category.
4. If AI returns `categoryId: null` → query DB for the system "Other" category (`userId: null, name: "Other"`).
5. If "Other" category does not exist in DB → respond `422 Unprocessable Entity`.

## Date Fallback Rule

- If AI returns `date: null` → use today's date in the provided `timezone`, formatted as `"YYYY-MM-DD"`.

## Amount Fallback Rule

- If AI returns `amount: null` → create transaction with `amount: undefined` (field omitted).
