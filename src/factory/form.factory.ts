import { FORMTYPE } from "@/commons/enums";
import { ActaForm } from "@/entities/acta.form.entity";
import { AdmissionForm } from "@/entities/admissions.entity";
import { FormEntity } from "@/entities/form.entity";
import { SemestralReportForm } from "@/entities/semestral_reports.entity";
import { PlanForm } from "@/entities/planForm.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class FormFactory {
  createForm(
    type: FORMTYPE,
    baseData: Partial<FormEntity>,
    specificData?: any
  ): { form: FormEntity; child: any } {
    const form = new FormEntity();
    Object.assign(form, baseData, { type });

    let childEntity: any;

    switch (type) {
      case FORMTYPE.INFORME_ADMISION:
        childEntity = new AdmissionForm();
        Object.assign(childEntity, specificData);
        childEntity.form = form;
        break;

      case FORMTYPE.PLAN_TRABAJO:
        childEntity = new PlanForm();
        Object.assign(childEntity, specificData);
        childEntity.form = form;
        break;

      case FORMTYPE.INFORME_SEMESTRAL:
        childEntity = new SemestralReportForm();
        Object.assign(childEntity, specificData);
        childEntity.form = form;
        break;

      case FORMTYPE.ACTAS:
        childEntity = new ActaForm();
        Object.assign(childEntity, specificData);
        childEntity.form = form;
        break;

      default:
        throw new Error(`Unsupported form type: ${type}`);
    }

    return { form, child: childEntity };
  }
}
