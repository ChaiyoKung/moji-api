# Contract: Auto-Transaction Status Field

## Endpoint

```
POST /transactions/auto
Authorization: Bearer <JWT>
Content-Type: multipart/form-data
```

## Request — New Field

| Field    | Type   | Required | Validation                        | Default  |
|----------|--------|----------|-----------------------------------|----------|
| `status` | string | No       | `@IsEnum(["draft", "confirmed"])` | `"draft"` |

All other request fields are unchanged (see milestone-2 contract/api.md).

## Behavior

- `dto.status ?? "draft"` replaces the hardcoded `"draft"` in `autoCreate()`.
- When `status: "confirmed"`, balance update fires immediately via existing `insertTransactionWithBalanceUpdate` logic.
- Response `status` field in `created[]` reflects the actual status used.

## Response

Response shape is unchanged. The `status` field in each `created[]` item will reflect the value used.
