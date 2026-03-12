import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
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

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  birth_date: Date;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}
