# Milestone 2 — Multi-Item AI Auto Transaction

## Tasks

- [x] task-1: Update `autoCreate()` in `TransactionsService` — change AI prompt + Zod schema to extract `{ items: [...] }`, process each item independently, collect `created`/`failed`, return `{ created, failed }` with `207` or throw `422` if all fail
- [x] task-2: Update `POST /transactions/auto` controller route — change return type handling, set HTTP `207` status code on response
- [x] task-3: Update unit tests for `autoCreate()` — cover multi-item happy path, partial failure, all-fail `422`, empty items `422`, date/amount/note fallbacks per item
- [x] task-4: Update `autoCreate()` system prompt — compute the user's current local datetime from `dto.timezone`, include it in the system prompt, and instruct the AI to use explicit meal-time clues first and otherwise apply the approved breakfast/lunch/dinner windows for ambiguous meal-category selection
- [x] task-5: Update `TransactionsService` unit tests — assert the system prompt includes the user's timezone and current local datetime context plus the approved meal-time disambiguation rules, including the `00:00-04:59` fallback behavior
