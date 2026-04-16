import { IsString, IsEmail, IsNotEmpty, IsEnum } from "class-validator";
import { UserRole } from "@/commons/enums";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  documentNumber: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}
