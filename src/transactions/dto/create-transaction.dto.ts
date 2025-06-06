import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsMongoId,
} from "class-validator";

export class CreateTransactionDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @IsMongoId()
  @IsNotEmpty()
  accountId: string;

  @IsMongoId()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  type: string; // "income" or "expense"

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsNotEmpty()
  date: Date;
}
