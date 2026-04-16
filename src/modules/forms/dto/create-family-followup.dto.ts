import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class FamilyFollowupDto {
  @IsOptional()
  @IsString({ message: "El campo 'professional' debe ser texto" })
  professional?: string;

  @IsNotEmpty({ message: "El campo 'period' es obligatorio" })
  @IsString({ message: "El campo 'period' debe ser texto" })
  period: string;

  @IsNotEmpty({ message: "El campo 'familyContext' es obligatorio" })
  @IsString({ message: "El campo 'familyContext' debe ser texto" })
  familyContext: string;

  @IsNotEmpty({ message: "El campo 'interventionSummary' es obligatorio" })
  @IsString({ message: "El campo 'interventionSummary' debe ser texto" })
  interventionSummary: string;

  @IsNotEmpty({ message: "El campo 'recommendations' es obligatorio" })
  @IsString({ message: "El campo 'recommendations' debe ser texto" })
  recommendations: string;
}
