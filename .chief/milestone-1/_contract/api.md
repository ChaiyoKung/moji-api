# Contract: API — POST /transactions/auto

## Endpoint

```
POST /transactions/auto
Authorization: Bearer <JWT>
Content-Type: multipart/form-data
```

## Request

| Field      | Type            | Required | Description |
|------------|-----------------|----------|-------------|
| `image`    | file (binary)   | No*      | Receipt or food photo. JPEG/PNG/WEBP. Max 10MB. |
| `text`     | string          | No*      | Free-text description of the purchase/receipt. |
| `accountId`| string (MongoId)| Yes      | Account to associate the transaction with. |
| `currency` | string          | Yes      | Currency code e.g. `"THB"`, `"USD"`. |
| `timezone` | string          | Yes      | IANA timezone e.g. `"Asia/Bangkok"`. |

\* At least one of `image` or `text` must be provided. If neither is present, respond `400 Bad Request`.

## Response — 201 Created

Returns the created transaction document (same shape as `POST /transactions`):

```json
{
  "_id": "...",
  "userId": "...",
  "accountId": "...",
  "categoryId": "...",
  "type": "expense",
  "amount": 120,
  "currency": "THB",
  "note": "Lunch at MK Restaurant",
  "date": "2026-06-22T06:00:00.000Z",
  "status": "draft",
  "createdAt": "...",
  "updatedAt": "..."
}
```

## Error Responses

| Status | Condition |
|--------|-----------|
| `400`  | Neither `image` nor `text` provided |
| `400`  | `accountId`, `currency`, or `timezone` missing |
| `401`  | Missing or invalid JWT |
| `404`  | Account not found |
| `422`  | AI extraction failed entirely (unrecoverable) |
