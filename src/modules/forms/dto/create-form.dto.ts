import { Type } from "class-transformer";
import { ValidateNested, IsEnum, IsNotEmptyObject } from "class-validator";
import { FORMTYPE } from "@/commons/enums";
import { BaseFormDto } from "./create-base-form.dto";
import { AdmissionFormDto } from "./create-admission-form.dto";
import { PlanFormDto } from "./create-plan-form.dto";
import { SemestralReportDto } from "./create-semestral-report.dto";
import { ActaFormDto } from "./create-actas-form.dto";

export class CreateFormDto {
  @IsEnum(FORMTYPE)
  type: FORMTYPE;

  @ValidateNested()
  @Type(() => BaseFormDto)
  @IsNotEmptyObject()
  baseData: BaseFormDto;

  @ValidateNested()
  @Type(() => Object)
  @IsNotEmptyObject()
  specificData:
    | AdmissionFormDto
    | PlanFormDto
    | SemestralReportDto
    | ActaFormDto;
}
