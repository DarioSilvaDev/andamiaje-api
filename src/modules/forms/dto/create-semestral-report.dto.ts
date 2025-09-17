import { IsNotEmpty, IsString, IsNumber } from "class-validator";

export class SemestralReportDto {
  @IsNotEmpty()
  @IsString()
  professional: string;

  @IsNotEmpty()
  @IsString()
  specialization: string;

  @IsNotEmpty()
  @IsNumber()
  licenseNumber: number;

  @IsNotEmpty()
  @IsString()
  period: string;

  @IsNotEmpty()
  @IsString()
  characterization: string;

  @IsNotEmpty()
  @IsString()
  evolution: string;

  @IsNotEmpty()
  @IsString()
  suggestions: string;
}
