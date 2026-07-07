# Contract: System Prompt — Quantity Expansion

## Change Scope

Only the `systemPrompt` string inside `autoCreate()` in
`src/transactions/transactions.service.ts` is modified.
No other files change.

## New Rules to Add to System Prompt

Add a dedicated "Quantity expansion" section to the existing rules list:

```
Quantity expansion rules:
- If an item specifies a quantity (e.g. "cola x2", "x3 donus", "2x cola", "cola (2)", "cola × 2", "cola 2 pcs", "cola qty:2", "cola 2nos"), treat the given amount as the TOTAL for all units.
- Expand that item into exactly N separate entries in "items", each with amount = round(total / N).
- All N entries share the same note, date, type, and categoryId.
- If N = 1, emit exactly one entry (no expansion needed).
- If total / N is not a whole number, round each entry to the nearest integer using standard rounding (0.5 rounds up).
- Items with no quantity indicator are extracted as a single entry (existing behavior, unchanged).
```

## AI Response Schema (unchanged)

The existing `aiResponseSchema` / `aiItemSchema` in the service is **not modified**.
The AI already returns a flat array of items — quantity expansion is handled purely
by the AI emitting multiple identical entries.

```ts
// unchanged
{
  items: Array<{
    type: "income" | "expense";
    amount: number | null;       // per-unit amount after division + rounding
    date: string | null;
    note: string | null;         // item name only, no "(1/2)" suffix
    categoryId: string;
  }>
}
```

## Examples

| Input | AI output items |
|-------|----------------|
| `cola x2 50 thb` | `[{note:"cola",amount:25}, {note:"cola",amount:25}]` |
| `donus x3 90 thb` | `[{note:"donus",amount:30},{note:"donus",amount:30},{note:"donus",amount:30}]` |
| `water x1 7 thb` | `[{note:"water",amount:7}]` |
| `cola x3 10 thb` | `[{note:"cola",amount:3},{note:"cola",amount:3},{note:"cola",amount:3}]` (3+3+3=9, AI rounds) |
| `coffee 50 thb` | `[{note:"coffee",amount:50}]` (no quantity, unchanged) |
