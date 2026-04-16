import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from "class-validator";

export class PlanFormDto {
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

  @ValidateIf((dto) => !dto.foundation)
  @IsNotEmpty({ message: "El campo 'fundamentation' es obligatorio" })
  @IsString({ message: "El campo 'fundamentation' debe ser texto" })
  fundamentation?: string;

  @ValidateIf((dto) => !dto.fundamentation)
  @IsNotEmpty({ message: "El campo 'foundation' es obligatorio" })
  @IsString({ message: "El campo 'foundation' debe ser texto" })
  foundation?: string;

  @IsArray()
  @IsString({ each: true })
  generalObjectives: string[];

  @IsArray()
  @IsString({ each: true })
  specificObjectives: string[];

  @ValidateIf((dto) => !dto.approachMethod)
  @IsNotEmpty({ message: "El campo 'workModality' es obligatorio" })
  @IsString({ message: "El campo 'workModality' debe ser texto" })
  workModality?: string;

  @ValidateIf((dto) => !dto.workModality)
  @IsNotEmpty({ message: "El campo 'approachMethod' es obligatorio" })
  @IsString({ message: "El campo 'approachMethod' debe ser texto" })
  approachMethod?: string;
}
