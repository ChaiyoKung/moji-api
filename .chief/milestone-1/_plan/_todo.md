# Milestone 1 — AI Auto Transaction

## Tasks

- [x] task-1: Add env vars and OpenAI SDK dependency
- [x] task-2: Create `AutoTransactionDto` and update `TransactionsModule` to inject `CategorySchema` + `ConfigService`
- [x] task-3: Implement `autoCreate()` in `TransactionsService` — fetch categories, call OpenAI, apply fallbacks, create draft transaction
- [x] task-4: Add `POST /transactions/auto` route to `TransactionsController` with `FileInterceptor` and `JwtAuthGuard`
- [x] task-5: Write unit tests for `autoCreate()` logic (category fallback, date fallback, amount fallback)
