# Contract: Schema

## Mongoose Schema Update

Add the `aiModel` field to the [src/transactions/schemas/transaction.schema.ts](src/transactions/schemas/transaction.schema.ts) class.

```typescript
@Schema({ timestamps: true })
export class Transaction {
  // ...existing fields...

  @Prop({ type: String, required: false })
  aiModel?: string;
}
```

### Constraints:
1. **Name**: `aiModel` (string type).
2. **Required**: `false`. Manual transaction creations or imports without an AI model will omit this field or leave it undefined in the database.
