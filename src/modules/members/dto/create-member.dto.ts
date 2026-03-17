import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsStrongPassword,
  Matches,
} from 'class-validator';

export class MemberDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z\s]+$/, { message: 'first name must contain letters only' })
  first_name: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z\s]+$/, { message: 'last name must contain letters only' })
  last_name: string;

  @Type(() => Number)
  @IsNotEmpty()
  sex: number;

  @IsNotEmpty()
  @Type(() => Date)
  birth_date: Date;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  region_id: string;

  @IsNotEmpty()
  @IsString()
  province_id: string;

  @IsNotEmpty()
  @IsString()
  city_id: string;

  @IsNotEmpty()
  @IsString()
  barangay_id: string;

  // @IsString()
  // @IsNotEmpty()
  // @IsStrongPassword()
  // password: string;
}
