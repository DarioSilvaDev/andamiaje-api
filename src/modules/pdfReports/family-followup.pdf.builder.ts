import { Injectable } from "@nestjs/common";
import { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import { BasePdfBuilder } from "./base.pdf.builder";

@Injectable()
export class FamilyFollowUpPdfBuilder extends BasePdfBuilder {
  build(data: Record<string, any>): TDocumentDefinitions {
    const content: Content[] = [
      ...this.createHeader("SEGUIMIENTO FAMILIAR"),
      {
        text: `Periodo: ${this.formatDate(data.periodStart)} - ${this.formatDate(data.periodEnd)}`,
        style: "normal",
        marginBottom: 15,
      },
      this.createPatientInfo(data.patient),
      ...this.createTextSection("Dinámica Familiar", data.familyDynamics?.communication?.description),
      ...this.createList("Fortalezas Familiares", data.periodEvaluation?.familyStrengths),
      ...this.createList("Áreas de Mejora", data.periodEvaluation?.areasForImprovement),
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
}

