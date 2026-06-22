# Goal: AI Auto Transaction from Image/Text

## Summary
Enable users to automatically create a draft transaction by submitting an image (e.g., receipt photo) and/or a text description. The backend uses AI to extract transaction details and creates a `draft` transaction on behalf of the user.

## Goals

### G1 — New endpoint `POST /transactions/auto`
Add a new route to the existing `TransactionsModule` that accepts `multipart/form-data` with an optional image file and optional text input (at least one must be provided).

### G2 — AI-powered extraction via OpenAI SDK
Integrate the OpenAI SDK (configurable base URL + API key) to analyze the submitted image and/or text and extract:
- `amount` — extracted from input; `undefined` if not confident
- `type` — `"income"` or `"expense"` inferred from context
- `date` — inferred from input (e.g., receipt timestamp); fallback to today's date in the given timezone
- `note` — a short AI-generated description of the transaction
- `categoryId` — matched from the user's existing categories (see G3)

### G3 — Category auto-matching
Before calling the AI, fetch the user's categories from MongoDB. Pass the category list to the AI prompt so it can select the best matching category by ID. If no suitable match exists, fall back to the system-provided "Other" category.

### G4 — Draft transaction creation
After AI extraction, immediately create and persist a transaction with `status: "draft"` using the existing `TransactionsService.create()` flow. Required client-provided fields: `accountId`, `currency`, `timezone`.

## Out of Scope
- No UI confirmation step on the backend — draft creation is immediate.
- Currency is not inferred from the image; always provided by the client.
- No new module — endpoint lives inside the existing `TransactionsModule`.
