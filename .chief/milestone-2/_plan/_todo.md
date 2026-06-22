# Milestone 2 — Multi-Item AI Auto Transaction

## Tasks

- [x] task-1: Update `autoCreate()` in `TransactionsService` — change AI prompt + Zod schema to extract `{ items: [...] }`, process each item independently, collect `created`/`failed`, return `{ created, failed }` with `207` or throw `422` if all fail
- [x] task-2: Update `POST /transactions/auto` controller route — change return type handling, set HTTP `207` status code on response
- [x] task-3: Update unit tests for `autoCreate()` — cover multi-item happy path, partial failure, all-fail `422`, empty items `422`, date/amount/note fallbacks per item
