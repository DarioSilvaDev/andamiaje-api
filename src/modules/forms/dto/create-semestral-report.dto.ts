import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  ValidateIf,
} from "class-validator";

export class SemestralReportDto {
  @IsOptional()
  @IsString({ message: "El campo 'professional' debe ser texto" })
  professional?: string;

  @IsOptional()
  @IsString({ message: "El campo 'specialization' debe ser texto" })
  specialization?: string;

  @IsOptional()
  @IsNumber()
  licenseNumber?: number;

  @IsNotEmpty({ message: "El campo 'period' es obligatorio" })
  @IsString({ message: "El campo 'period' debe ser texto" })
  period: string;

  @IsNotEmpty({ message: "El campo 'characterization' es obligatorio" })
  @IsString({ message: "El campo 'characterization' debe ser texto" })
  characterization: string;

  @ValidateIf((dto) => !dto.evolution)
  @IsNotEmpty({ message: "El campo 'periodEvolution' es obligatorio" })
  @IsString({ message: "El campo 'periodEvolution' debe ser texto" })
  periodEvolution?: string;

  @ValidateIf((dto) => !dto.periodEvolution)
  @IsNotEmpty({ message: "El campo 'evolution' es obligatorio" })
  @IsString({ message: "El campo 'evolution' debe ser texto" })
  evolution?: string;

  @IsNotEmpty({ message: "El campo 'suggestions' es obligatorio" })
  @IsString({ message: "El campo 'suggestions' debe ser texto" })
  suggestions: string;
}
