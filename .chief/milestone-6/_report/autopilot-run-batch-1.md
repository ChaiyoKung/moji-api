# Autopilot Run Batch 1

## Mode
auto

## Summary
Updated the AI system prompt to instruct the AI to return `note: null` when the note text contains the matched category name (case-insensitive substring match). Added 3 unit tests verifying the behavior via mocked AI responses. All 20 tests pass.

## Tasks Completed
- task-1: Updated `note` rule line in `systemPrompt` inside `autoCreate()` in `src/transactions/transactions.service.ts` — appended the case-insensitive substring null rule
- task-2: Added 3 test cases in `src/transactions/transactions.service.spec.ts` covering note=null (exact match), note=null (substring match), and note kept when no match

## Decisions Made
None — no ambiguity encountered.

## Backlog
None — all milestone goals met.

## User Action Needed
None.
