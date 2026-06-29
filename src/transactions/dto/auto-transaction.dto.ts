import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class AutoTransactionDto {
  @IsMongoId()
  @IsNotEmpty()
  accountId: string;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsNotEmpty()
  timezone: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsEnum(["draft", "confirmed"])
  status?: "draft" | "confirmed";
}
