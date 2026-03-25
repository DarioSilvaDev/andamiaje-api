import { IsNotEmpty, IsString, IsNumber, IsDateString, IsOptional } from "class-validator";

export class BaseFormDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  patientName?: string;

  @IsOptional()
  @IsString()
  patientDocumentNumber?: string;

  @IsOptional()
  @IsNumber()
  patientAge?: number;

  @IsOptional()
  @IsDateString()
  patientBirthDate?: string;

  @IsOptional()
  @IsString()
  patientDiagnosis?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
