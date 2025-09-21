import { IsNotEmpty, IsString, IsNumber, IsArray } from "class-validator";

export class PlanFormDto {
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

  @IsNotEmpty({ message: "El campo 'foundation' es obligatorio" })
  @IsString({ message: "El campo 'foundation' debe ser texto" })
  foundation: string;

  @IsArray()
  @IsString({ each: true })
  generalObjectives: string[];

  @IsArray()
  @IsString({ each: true })
  specificObjectives: string[];

  @IsNotEmpty({ message: "El campo 'approachMethod' es obligatorio" })
  @IsString({ message: "El campo 'approachMethod' debe ser texto" })
  approachMethod: string;
}
