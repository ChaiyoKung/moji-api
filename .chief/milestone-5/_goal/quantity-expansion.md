# Goal: Quantity Expansion in Auto Transaction

## Problem

The current system prompt does not handle quantity multipliers in user input.
When a user types `cola x2 50 thb`, the AI treats it as a single transaction for 50 thb
instead of two separate transactions for 25 thb each.

## Goal

Update the AI system prompt in `autoCreate()` so that when the user's input contains
a quantity indicator, the AI expands the item into N separate identical transactions,
each with `amount = total ÷ N` (rounded to nearest integer).

## Success Criteria

1. Input `cola x2 50 thb` → AI returns 2 items: `{ note: "cola", amount: 25 }` × 2
2. Input `donus x3 90 thb` → AI returns 3 items: `{ note: "donus", amount: 30 }` × 3
3. Input `water x1 7 thb` → AI returns 1 item: `{ note: "water", amount: 7 }` (no expansion needed)
4. Non-integer division (e.g., `cola x3 10 thb`) → amounts rounded: e.g., 3 + 3 + 4 or all 3 — AI rounds naturally
5. Items without a quantity indicator are extracted as-is (no behavior change)
6. Backend code (`transactions.service.ts`) is NOT modified — only the system prompt changes

## Quantity Patterns to Recognize

All of the following patterns must be handled:

| Pattern | Example |
|---------|---------|
| `xN` suffix | `cola x2` |
| `Nx` suffix | `cola 2x` |
| `xN` prefix | `x2 cola` |
| `Nx` prefix | `2x cola` |
| Parenthesized | `cola (2)` |
| Unicode multiply | `cola × 2` |
| pcs/qty/nos | `cola 2 pcs`, `cola qty:2`, `cola 2nos` |

## Scope

- **Only change:** system prompt string in `src/transactions/transactions.service.ts`
- **No changes to:** DTO, schema, controller, or any other file
