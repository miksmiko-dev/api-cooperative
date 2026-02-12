import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';

export class AuthRegisterDTO {
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  last_name: string;

  @IsNumber()
  @IsNotEmpty()
  @MaxLength(1)
  sex: number;

  @IsNotEmpty()
  @IsDate()
  birth_date: Date;

  @IsNumber()
  @IsNotEmpty()
  region_id: number;

  @IsNumber()
  @IsNotEmpty()
  municipal_id: number;

  @IsNumber()
  @IsNotEmpty()
  city_id: number;

  @IsNumber()
  @IsNotEmpty()
  brgy_id: number;

  @IsString()
  address: string;

  @IsEmail()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}
