import {
  IsOptional,
  IsString,
  IsNumber,
  IsMongoId,
  IsNotEmpty,
  IsEnum,
} from "class-validator";

export class UpdateTransactionDto {
  @IsMongoId()
  @IsNotEmpty()
  categoryId: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsEnum(["draft", "confirmed"])
  status?: "draft" | "confirmed";
}
