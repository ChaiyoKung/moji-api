import { IsNotEmpty, IsOptional, IsString, IsNumber } from "class-validator";
import { IsMongoId } from "class-validator";

export class CreateAccountDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsOptional()
  @IsNumber()
  balance?: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsOptional()
  @IsString()
  icon?: string;
}
