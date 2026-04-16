import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CompanionFollowupDto {
  @IsOptional()
  @IsString({ message: "El campo 'professional' debe ser texto" })
  professional?: string;

  @IsNotEmpty({ message: "El campo 'period' es obligatorio" })
  @IsString({ message: "El campo 'period' debe ser texto" })
  period: string;

  @IsNotEmpty({ message: "El campo 'accompanimentDetail' es obligatorio" })
  @IsString({ message: "El campo 'accompanimentDetail' debe ser texto" })
  accompanimentDetail: string;

  @IsNotEmpty({ message: "El campo 'studentEvolution' es obligatorio" })
  @IsString({ message: "El campo 'studentEvolution' debe ser texto" })
  studentEvolution: string;

  @IsNotEmpty({ message: "El campo 'recommendations' es obligatorio" })
  @IsString({ message: "El campo 'recommendations' debe ser texto" })
  recommendations: string;
}
