import { Injectable } from "@nestjs/common";
import { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import { BasePdfBuilder } from "./base.pdf.builder";

@Injectable()
export class SemestralReportPdfBuilder extends BasePdfBuilder {
  build(data: Record<string, any>): TDocumentDefinitions {
    const content: Content[] = [
      ...this.createHeader(
        "INFORME SEMESTRAL DE PROGRESO",
        `Semestre ${data.semester}/${data.year}`
      ),
      {
        text: `Periodo: ${this.formatDate(data.periodStart)} - ${this.formatDate(data.periodEnd)}`,
        style: "normal",
        marginBottom: 15,
      },
      this.createPatientInfo(data.patient),
      ...this.createTextSection("Resumen Ejecutivo", data.executiveSummary),
      this.createAreasEvaluation(data.areasEvaluation),
      ...this.createTextSection("Conclusiones", data.conclusions),
      ...this.createTextSection("Recomendaciones", data.recommendations),
    ];

    return {
      content,
      styles: this.defaultStyles,
      defaultStyle: this.defaultStyle,
      footer: (currentPage, pageCount) =>
        this.createFooter(currentPage, pageCount),
    };
  }

  private createAreasEvaluation(areasEvaluation: any): Content {
    if (!areasEvaluation) return { text: "" } as any;

    const areas = [
      { name: "Comunicación", data: areasEvaluation.communication },
      { name: "Cognición", data: areasEvaluation.cognition },
      { name: "Habilidades Sociales", data: areasEvaluation.socialSkills },
      { name: "Autonomía", data: areasEvaluation.autonomy },
    ];

    return [
      {
        text: "Evaluación por Áreas",
        style: "subheader",
        marginTop: 10,
      } as any,
      {
        table: {
          widths: ["*", "auto"],
          body: [
            [
              { text: "Área", style: "tableHeader" },
              { text: "Puntuación", style: "tableHeader" },
            ],
            ...areas.map((area) => [
              area.name,
              area.data?.score ? `${area.data.score}/10` : "N/A",
            ]),
          ],
        },
        layout: "lightHorizontalLines",
        marginBottom: 15,
      } as any,
    ] as any;
  }
}
