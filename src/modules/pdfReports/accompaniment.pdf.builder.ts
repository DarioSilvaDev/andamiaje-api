import { Injectable } from "@nestjs/common";
import { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import { BasePdfBuilder } from "./base.pdf.builder";

@Injectable()
export class AccompanimentPdfBuilder extends BasePdfBuilder {
  build(data: Record<string, any>): TDocumentDefinitions {
    const content: Content[] = [
      ...this.createHeader("SEGUIMIENTO DE ACOMPAÑANTE EXTERNO"),
      {
        text: `Acompañante: ${data.accompanistInfo?.name || "No especificado"}`,
        style: "normal",
        marginBottom: 5,
      },
      {
        text: `Periodo: ${this.formatDate(data.periodStart)} - ${this.formatDate(data.periodEnd)}`,
        style: "normal",
        marginBottom: 15,
      },
      this.createPatientInfo(data.patient),
      ...this.createList("Fortalezas", data.strengths),
      ...this.createList("Áreas de Mejora", data.areasForImprovement),
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

