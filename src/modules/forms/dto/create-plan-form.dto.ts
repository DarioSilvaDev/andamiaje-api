import { IsNotEmpty, IsString, IsNumber, IsArray } from "class-validator";

export class PlanFormDto {
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
  foundation: string;

  @IsArray()
  @IsString({ each: true })
  generalObjectives: string[];

  @IsArray()
  @IsString({ each: true })
  specificObjectives: string[];

  @IsNotEmpty()
  @IsString()
  approachMethod: string;
}
