import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { IsMongoId } from "class-validator";

export class CreateCategoryDto {
  @IsOptional()
  @IsMongoId()
  userId?: string | null;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(["income", "expense"])
  type: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsMongoId()
  parentId?: string | null;
}
