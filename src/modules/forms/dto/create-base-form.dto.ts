import { IsNotEmpty, IsString, IsNumber, IsDateString } from "class-validator";

export class BaseFormDto {
  @IsNotEmpty()
  @IsString()
  patient: string;

  @IsNotEmpty()
  @IsString() // Dado que el DNI puede tener ceros a la izquierda
  dni: string;

  @IsNotEmpty()
  @IsNumber()
  age: number;

  @IsNotEmpty()
  @IsDateString()
  birthDate: string;

  @IsNotEmpty()
  @IsString()
  diagnosis: string;

  @IsNotEmpty()
  @IsDateString()
  date: string;
}
