import { Type } from "class-transformer";
import { ValidateNested, IsEnum, IsNotEmptyObject } from "class-validator";
import { FORMTYPE } from "@/commons/enums";
import { BaseFormDto } from "./create-base-form.dto";
import { AdmissionFormDto } from "./create-admission-form.dto";
import { PlanFormDto } from "./create-plan-form.dto";
import { SemestralReportDto } from "./create-semestral-report.dto";
import { ActaFormDto } from "./create-actas-form.dto";
import { SpecificDataType } from "./specific-data.dto";

export class CreateFormDto {
  @IsEnum(FORMTYPE, {
    message: "El campo 'type' debe ser un tipo de formulario válido",
  })
  type: FORMTYPE;

  @ValidateNested()
  @Type(() => BaseFormDto)
  @IsNotEmptyObject()
  baseData: BaseFormDto;

  @ValidateNested()
  @Type((options) => {
    const object = options?.newObject || {};
    return SpecificFormDtoMap[object.type] || Object;
  })
  @IsNotEmptyObject()
  @SpecificDataType()
  specificData: any;
}

export const SpecificFormDtoMap = {
  [FORMTYPE.ACTAS]: ActaFormDto,
  [FORMTYPE.INFORME_ADMISION]: AdmissionFormDto,
  [FORMTYPE.PLAN_TRABAJO]: PlanFormDto,
  [FORMTYPE.INFORME_SEMESTRAL]: SemestralReportDto,
};
