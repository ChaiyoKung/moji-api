# Goal: AI-Generated Content Label

## Summary
Add an `aiModel` text field to the transaction schema and populate it inside the auto-creation endpoint (`POST /transactions/auto`) with the AI model name used for the parsing.

## Goals

### G1 — Schema Field Extension
Extend the `Transaction` schema in [src/transactions/schemas/transaction.schema.ts](src/transactions/schemas/transaction.schema.ts) to include an optional string field `aiModel`:
- Field name: `aiModel`
- Type: `String`
- Optional: Yes (will not exist for manual transactions or older transactions)

### G2 — Auto-Populate AI Model
Update the `autoCreate()` method in [src/transactions/transactions.service.ts](src/transactions/transactions.service.ts) so that each transaction created from AI parsing has its `aiModel` property populated with the name of the model used (e.g. dynamic value of the model used for the completion, retrieved from config or defaulting to `"gemini-3.5-flash"`).

### G3 — Read-Only Public API
Ensure `aiModel` is omitted from both creation and update endpoints for manual operations:
- Keep it out of [src/transactions/dto/create-transaction.dto.ts](src/transactions/dto/create-transaction.dto.ts) and [src/transactions/dto/update-transaction.dto.ts](src/transactions/dto/update-transaction.dto.ts).
- Manual creation/updates are not allowed to inject or alter `aiModel`.

## Out of Scope
- No modification of `isAiGenerated` booleans or complex nested structures.
- No historical data migration to populate older AI-generated transactions.
