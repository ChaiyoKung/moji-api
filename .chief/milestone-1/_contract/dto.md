# Contract: DTOs and Module Changes

## New DTO — AutoTransactionDto

File: `src/transactions/dto/auto-transaction.dto.ts`

```ts
export class AutoTransactionDto {
  // multipart fields (non-file)
  accountId: string;   // MongoId, required
  currency: string;    // required
  timezone: string;    // required
  text?: string;       // optional free-text input
  // image is injected separately via @UploadedFile() — not a class field
}
```

## Module Changes

### TransactionsModule
- Add `CategoriesModule` import (or directly import `CategorySchema`) to access categories collection.
- Add `ConfigModule` (already present — no change needed).
- Register `MulterModule` (or use `FileInterceptor` inline — no global Multer config needed).

### TransactionsController
- Add `POST /auto` route with `@UseGuards(JwtAuthGuard)` and `@UseInterceptors(FileInterceptor('image'))`.

### TransactionsService
- Add `autoCreate(dto, imageBuffer, userId)` method.
- Inject `CategoryModel` (via `@InjectModel(Category.name)`).
- Inject `ConfigService` (already injected via module).

## Environment Variables (new)

Add to `.env` and env validation:

```
OPENAI_BASE_URL=https://...
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
```
