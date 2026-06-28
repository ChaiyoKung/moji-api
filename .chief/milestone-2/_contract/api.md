# Contract: API — POST /transactions/auto (multi-item)

## Endpoint

```
POST /transactions/auto
Authorization: Bearer <JWT>
Content-Type: multipart/form-data
```

## Request

Unchanged from milestone 1:

| Field       | Type             | Required | Description |
|-------------|------------------|----------|-------------|
| `image`     | file (binary)    | No*      | Receipt or food photo. JPEG/PNG/WEBP. Max 10MB. |
| `text`      | string           | No*      | Free-text description of the purchase/receipt. |
| `accountId` | string (MongoId) | Yes      | Account to associate transactions with. |
| `currency`  | string           | Yes      | Currency code e.g. `"THB"`, `"USD"`. |
| `timezone`  | string           | Yes      | IANA timezone e.g. `"Asia/Bangkok"`. |

\* At least one of `image` or `text` must be provided.

## Response — 207 Multi-Status

Returned when at least one transaction was successfully created:

```json
{
  "created": [
    {
      "_id": "...",
      "userId": "...",
      "accountId": "...",
      "categoryId": "...",
      "type": "expense",
      "amount": 120,
      "currency": "THB",
      "note": "Pad Thai",
      "date": "2026-06-23T06:00:00.000Z",
      "status": "draft",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "failed": [
    { "item": 2, "reason": "AI returned a categoryId that does not match any of the user's categories" }
  ]
}
```

- `created` — array of created Transaction documents (may be empty only if all failed).
- `failed` — array of failed items with 1-based `item` number and `reason` string. Empty array if all succeeded.

## Response — 422 Unprocessable Entity

Returned when ALL items fail validation OR the AI returns an empty `items` array:

```json
{
  "statusCode": 422,
  "message": "...",
  "failed": [
    { "item": 1, "reason": "..." }
  ]
}
```

## Error Responses

| Status | Condition |
|--------|-----------|
| `400`  | Neither `image` nor `text` provided |
| `400`  | `accountId`, `currency`, or `timezone` missing |
| `401`  | Missing or invalid JWT |
| `422`  | AI returns empty items array |
| `422`  | All items fail validation |
