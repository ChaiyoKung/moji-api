# Milestone 3 — AI Generated Content Label

## Tasks

- [x] task-1: Update Mongoose Schema — Add `aiModel?: string` to `Transaction` in [src/transactions/schemas/transaction.schema.ts](src/transactions/schemas/transaction.schema.ts)
- [x] task-2: Update `autoCreate()` Service Method — Extract the config-resolved model name and inject it into each draft transaction created during AI receipt/text parsing in [src/transactions/transactions.service.ts](src/transactions/transactions.service.ts)
- [x] task-3: Write Unit Tests — Update the test blocks in [src/transactions/transactions.service.spec.ts](src/transactions/transactions.service.spec.ts) to assert that `aiModel` is present on transactions created through the auto-endpoint, and absent for manually created transactions
