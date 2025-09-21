import { IsNotEmpty, IsString, IsNumber } from "class-validator";

export class SemestralReportDto {
  @IsNotEmpty({ message: "El campo 'professional' es obligatorio" })
  @IsString({ message: "El campo 'professional' debe ser texto" })
  professional: string;

  @IsNotEmpty({ message: "El campo 'specialization' es obligatorio" })
  @IsString({ message: "El campo 'specialization' debe ser texto" })
  specialization: string;

  @IsNotEmpty()
  @IsNumber()
  licenseNumber: number;

  @IsNotEmpty({ message: "El campo 'period' es obligatorio" })
  @IsString({ message: "El campo 'period' debe ser texto" })
  period: string;

  @IsNotEmpty({ message: "El campo 'characterization' es obligatorio" })
  @IsString({ message: "El campo 'characterization' debe ser texto" })
  characterization: string;

  @IsNotEmpty({ message: "El campo 'evolution' es obligatorio" })
  @IsString({ message: "El campo 'evolution' debe ser texto" })
  evolution: string;

  @IsNotEmpty({ message: "El campo 'suggestions' es obligatorio" })
  @IsString({ message: "El campo 'suggestions' debe ser texto" })
  suggestions: string;
}
