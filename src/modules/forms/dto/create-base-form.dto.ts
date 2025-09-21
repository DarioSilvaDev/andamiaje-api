import { IsNotEmpty, IsString, IsNumber, IsDateString } from "class-validator";

export class BaseFormDto {
  @IsNotEmpty({ message: "El campo 'patient' es obligatorio" })
  @IsString({ message: "El campo 'patient' debe ser texto" })
  patient: string;

  @IsNotEmpty({ message: "El campo 'documentNumber' es obligatorio" })
  @IsString({ message: "El campo 'documentNumber' debe ser texto" })
  documentNumber: string;

  @IsNotEmpty({ message: "El campo 'age' es obligatorio" })
  @IsNumber()
  age: number;

  @IsNotEmpty({ message: "El campo 'birthDate' es obligatorio" })
  @IsDateString()
  birthDate: string;

  @IsNotEmpty({ message: "El campo 'diagnosis' es obligatorio" })
  @IsString()
  diagnosis: string;

  @IsNotEmpty({ message: "El campo 'fecha' es obligatorio" })
  @IsDateString()
  fecha: string;
}
