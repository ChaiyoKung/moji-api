# Contract: API

## DTO Invariance

To guarantee that `aiModel` is a read-only audit log, it must **not** be included in standard user-facing DTO inputs:
- [src/transactions/dto/create-transaction.dto.ts](src/transactions/dto/create-transaction.dto.ts) must **not** contain it.
- [src/transactions/dto/update-transaction.dto.ts](src/transactions/dto/update-transaction.dto.ts) must **not** contain it.
- Manual transaction creations (`POST /transactions`) or updates (`PUT /transactions/:id`) are unchanged and cannot modify this field.

## Auto Transactions Endpoint Output Change

When executing a successful AI transaction extraction via `POST /transactions/auto`, the parsed transactions in the response's `created` list will contain the `aiModel` property.

### Successful Response Format Example (HTTP 207 or 201)

```json
{
  "created": [
    {
      "_id": "64ca8f56efb90ad8e11a3b11",
      "userId": "64ca8f56efb90ad8e11a3b00",
      "accountId": "64ca8f56efb90ad8e11b3b22",
      "categoryId": "64ca8f56efb90ad8e11c3b33",
      "type": "expense",
      "amount": 120,
      "currency": "THB",
      "note": "Pad Thai",
      "date": "2026-06-23T00:00:00.000Z",
      "status": "draft",
      "aiModel": "gemini-3.5-flash",
      "createdAt": "2026-06-23T10:00:00.000Z",
      "updatedAt": "2026-06-23T10:00:00.000Z"
    }
  ],
  "failed": []
}
```

The `aiModel` value is dynamically retrieved in `TransactionsService` using the loaded environment configs:
`const model = this.configService.get<string>("OPENAI_MODEL", "gemini-3.5-flash");`
This guarantees the exact runtime model used for AI parsing is correctly attributed to the created records.
