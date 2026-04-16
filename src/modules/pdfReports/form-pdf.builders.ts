import { Content, TDocumentDefinitions } from "pdfmake/interfaces";

interface BuilderSection {
  title: string;
  value: string | number | null | undefined;
}

interface BuilderOptions {
  title: string;
  subtitle?: string;
  sections: BuilderSection[];
}

function buildBySections(options: BuilderOptions): TDocumentDefinitions {
  const sectionBlocks: Content[] = options.sections.map((section) => ({
    stack: [
      { text: section.title, style: "label" },
      { text: section.value ?? "Sin informacion", style: "value" },
    ],
    margin: [0, 0, 0, 10],
  }));

  return {
    content: [
      { text: options.title, style: "title" },
      options.subtitle ? { text: options.subtitle, style: "subtitle" } : "",
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: 520,
            y2: 0,
            lineWidth: 1,
            lineColor: "#B7C0CC",
          },
        ],
        margin: [0, 0, 0, 16],
      },
      ...sectionBlocks,
    ],
    styles: {
      title: {
        fontSize: 18,
        bold: true,
        color: "#17324D",
        margin: [0, 0, 0, 6],
      },
      subtitle: {
        fontSize: 11,
        color: "#5E6B7A",
        margin: [0, 0, 0, 14],
      },
      label: {
        fontSize: 10,
        bold: true,
        color: "#3F4F63",
        margin: [0, 0, 0, 2],
      },
      value: {
        fontSize: 11,
        color: "#202833",
      },
    },
    defaultStyle: {
      font: "Roboto",
    },
  };
}

export function buildAdmissionPdf(data: {
  patient: string;
  diagnosis: string;
  introduction: string;
  characterization: string;
  professional: string;
  date: Date;
}): TDocumentDefinitions {
  return buildBySections({
    title: "Informe de admision",
    subtitle: `Paciente: ${data.patient}`,
    sections: [
      { title: "Profesional", value: data.professional },
      { title: "Fecha", value: data.date?.toISOString().slice(0, 10) },
      { title: "Diagnostico", value: data.diagnosis },
      { title: "Introduccion", value: data.introduction },
      { title: "Caracterizacion", value: data.characterization },
    ],
  });
}

export function buildPlanPdf(data: {
  patient: string;
  period: string;
  fundamentation: string;
  generalObjectives: string[];
  specificObjectives: string[];
  workModality: string;
  professional: string;
}): TDocumentDefinitions {
  return buildBySections({
    title: "Plan de trabajo",
    subtitle: `Paciente: ${data.patient}`,
    sections: [
      { title: "Profesional", value: data.professional },
      { title: "Periodo", value: data.period },
      { title: "Fundamentacion", value: data.fundamentation },
      {
        title: "Objetivos generales",
        value: data.generalObjectives?.join("\n") || "Sin informacion",
      },
      {
        title: "Objetivos especificos",
        value: data.specificObjectives?.join("\n") || "Sin informacion",
      },
      { title: "Modalidad de trabajo", value: data.workModality },
    ],
  });
}

export function buildSemestralPdf(data: {
  patient: string;
  period: string;
  characterization: string;
  periodEvolution: string;
  suggestions: string;
  professional: string;
}): TDocumentDefinitions {
  return buildBySections({
    title: "Informe semestral",
    subtitle: `Paciente: ${data.patient}`,
    sections: [
      { title: "Profesional", value: data.professional },
      { title: "Periodo", value: data.period },
      { title: "Caracterizacion", value: data.characterization },
      { title: "Evolucion del periodo", value: data.periodEvolution },
      { title: "Sugerencias", value: data.suggestions },
    ],
  });
}

export function buildMonthlyReportPdf(data: {
  patient: string;
  period: string;
  activities: string;
  progress: string;
  observations: string;
  professional: string;
}): TDocumentDefinitions {
  return buildBySections({
    title: "Reporte mensual",
    subtitle: `Paciente: ${data.patient}`,
    sections: [
      { title: "Profesional", value: data.professional },
      { title: "Periodo", value: data.period },
      { title: "Actividades", value: data.activities },
      { title: "Progreso", value: data.progress },
      { title: "Observaciones", value: data.observations },
    ],
  });
}

export function buildCompanionFollowupPdf(data: {
  patient: string;
  period: string;
  accompanimentDetail: string;
  studentEvolution: string;
  recommendations: string;
  professional: string;
}): TDocumentDefinitions {
  return buildBySections({
    title: "Seguimiento de acompaniante externo",
    subtitle: `Paciente: ${data.patient}`,
    sections: [
      { title: "Profesional", value: data.professional },
      { title: "Periodo", value: data.period },
      { title: "Detalle de acompanamiento", value: data.accompanimentDetail },
      { title: "Evolucion del alumno", value: data.studentEvolution },
      { title: "Recomendaciones", value: data.recommendations },
    ],
  });
}

export function buildFamilyFollowupPdf(data: {
  patient: string;
  period: string;
  familyContext: string;
  interventionSummary: string;
  recommendations: string;
  professional: string;
}): TDocumentDefinitions {
  return buildBySections({
    title: "Seguimiento familiar",
    subtitle: `Paciente: ${data.patient}`,
    sections: [
      { title: "Profesional", value: data.professional },
      { title: "Periodo", value: data.period },
      { title: "Contexto familiar", value: data.familyContext },
      { title: "Resumen de intervencion", value: data.interventionSummary },
      { title: "Recomendaciones", value: data.recommendations },
    ],
  });
}

export function buildInvoicePdf(data: {
  patient: string;
  issuerName: string;
  taxId: string;
  billingPeriod: string;
  amount: number;
  serviceDescription: string;
}): TDocumentDefinitions {
  return buildBySections({
    title: "Factura",
    subtitle: `Paciente: ${data.patient}`,
    sections: [
      { title: "Emisor", value: data.issuerName },
      { title: "CUIT/ID", value: data.taxId },
      { title: "Periodo de facturacion", value: data.billingPeriod },
      { title: "Monto", value: `$ ${data.amount.toFixed(2)}` },
      { title: "Descripcion del servicio", value: data.serviceDescription },
    ],
  });
}
