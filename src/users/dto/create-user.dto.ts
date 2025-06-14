import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

class ProviderDto {
  @IsString()
  @IsNotEmpty()
  provider: string;

  @IsString()
  @IsNotEmpty()
  providerId: string;

  @IsNotEmpty()
  linkedAt: Date;
}

class SettingsDto {
  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  language?: string;
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ValidateNested({ each: true })
  @Type(() => ProviderDto)
  @IsOptional()
  providers?: ProviderDto[];

  @ValidateNested()
  @Type(() => SettingsDto)
  @IsOptional()
  settings?: SettingsDto;
}
