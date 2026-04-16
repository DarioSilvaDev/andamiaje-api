import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class MonthlyReportDto {
  @IsOptional()
  @IsString({ message: "El campo 'professional' debe ser texto" })
  professional?: string;

  @IsNotEmpty({ message: "El campo 'period' es obligatorio" })
  @IsString({ message: "El campo 'period' debe ser texto" })
  period: string;

  @IsNotEmpty({ message: "El campo 'activities' es obligatorio" })
  @IsString({ message: "El campo 'activities' debe ser texto" })
  activities: string;

  @IsNotEmpty({ message: "El campo 'progress' es obligatorio" })
  @IsString({ message: "El campo 'progress' debe ser texto" })
  progress: string;

  @IsNotEmpty({ message: "El campo 'observations' es obligatorio" })
  @IsString({ message: "El campo 'observations' debe ser texto" })
  observations: string;
}
