import { Injectable } from "@nestjs/common";
import { FORMTYPE } from "@/commons/enums";
import {
  BaseForm,
  ActaFormV2,
  AdmissionFormV2,
  PlanFormV2,
  SemestralReportFormV2,
  MonthlyReportFormV2,
  AccompanimentFollowUpFormV2,
  FamilyFollowUpFormV2,
  InvoiceFormV2,
  User,
} from "@/entities";

@Injectable()
export class FormFactoryV2 {
  /**
   * Crea una instancia del formulario específico según el tipo
   */
  createForm(
    type: FORMTYPE,
    baseData: Partial<BaseForm>,
    specificData: any,
    createdBy: User
  ): BaseForm {
    let form: BaseForm;

    switch (type) {
      case FORMTYPE.ACTAS:
        form = new ActaFormV2();
        break;

      case FORMTYPE.INFORME_ADMISION:
        form = new AdmissionFormV2();
        break;

      case FORMTYPE.PLAN_TRABAJO:
        form = new PlanFormV2();
        break;

      case FORMTYPE.INFORME_SEMESTRAL:
        form = new SemestralReportFormV2();
        break;

      case FORMTYPE.REPORTE_MENSUAL:
        form = new MonthlyReportFormV2();
        break;

      case FORMTYPE.SEGUIMIENTO_ACOMPANANTE:
        form = new AccompanimentFollowUpFormV2();
        break;

      case FORMTYPE.SEGUIMIENTO_FAMILIA:
        form = new FamilyFollowUpFormV2();
        break;

      case FORMTYPE.FACTURA:
        form = new InvoiceFormV2();
        break;

      default:
        throw new Error(`Tipo de formulario no soportado: ${type}`);
    }

    // Asignar datos base
    form.createdBy = createdBy;
    form.type = type;

    // Asignar datos del paciente si existen
    if (baseData.patientName) {
      form.setPatientInfo({
        name: baseData.patientName,
        documentNumber: baseData.patientDocumentNumber,
        age: baseData.patientAge,
        birthDate: baseData.patientBirthDate,
        diagnosis: baseData.patientDiagnosis,
      });
    }

    // Asignar notas si existen
    if (baseData.notes) {
      form.notes = baseData.notes;
    }

    // Asignar datos específicos del formulario
    if (specificData) {
      form.setFormData(specificData);
    }

    return form;
  }

  /**
   * Obtiene los campos requeridos para un tipo de formulario
   */
  getRequiredFields(type: FORMTYPE): string[] {
    const commonFields = ["title"];
    const specificFields: Record<FORMTYPE, string[]> = {
      [FORMTYPE.ACTAS]: [
        "modality",
        "subject",
        "agenda",
        "meetingDate",
        "attendees",
        "decisions",
      ],
      [FORMTYPE.INFORME_ADMISION]: [
        "admissionDate",
        "referralSource",
        "referralReason",
        "patientName",
        "patientDocumentNumber",
        "diagnosis",
        "recommendations",
        "conclusions",
      ],
      [FORMTYPE.PLAN_TRABAJO]: [
        "startDate",
        "endDate",
        "generalObjectives",
        "specificObjectives",
        "methodology",
        "evaluationMethod",
        "patientName",
      ],
      [FORMTYPE.INFORME_SEMESTRAL]: [
        "periodStart",
        "periodEnd",
        "executiveSummary",
        "objectivesEvaluation",
        "areasEvaluation",
        "sessionsInfo",
        "conclusions",
        "recommendations",
        "patientName",
      ],
      [FORMTYPE.REPORTE_MENSUAL]: [
        "month",
        "year",
        "monthlySummary",
        "activities",
        "progress",
        "attendance",
      ],
      [FORMTYPE.SEGUIMIENTO_ACOMPANANTE]: [
        "accompanistInfo",
        "periodStart",
        "periodEnd",
        "accompanimentActivities",
        "evaluation",
        "recommendations",
      ],
      [FORMTYPE.SEGUIMIENTO_FAMILIA]: [
        "familyComposition",
        "periodStart",
        "periodEnd",
        "familyContacts",
        "familyDynamics",
        "recommendations",
      ],
      [FORMTYPE.FACTURA]: [
        "invoiceNumber",
        "invoiceDate",
        "clientInfo",
        "items",
        "total",
      ],
    };

    return [...commonFields, ...(specificFields[type] || [])];
  }

  /**
   * Obtiene el nombre descriptivo del tipo de formulario
   */
  getFormTypeName(type: FORMTYPE): string {
    const typeNames: Record<FORMTYPE, string> = {
      [FORMTYPE.ACTAS]: "Acta de Reunión",
      [FORMTYPE.INFORME_ADMISION]: "Informe de Admisión",
      [FORMTYPE.PLAN_TRABAJO]: "Plan de Trabajo Terapéutico",
      [FORMTYPE.INFORME_SEMESTRAL]: "Informe Semestral de Progreso",
      [FORMTYPE.REPORTE_MENSUAL]: "Reporte Mensual",
      [FORMTYPE.SEGUIMIENTO_ACOMPANANTE]: "Seguimiento de Acompañante Externo",
      [FORMTYPE.SEGUIMIENTO_FAMILIA]: "Seguimiento Familiar",
      [FORMTYPE.FACTURA]: "Factura/Comprobante",
    };

    return typeNames[type] || type;
  }
}
