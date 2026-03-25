import { Injectable } from "@nestjs/common";
import { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import { BasePdfBuilder } from "./base.pdf.builder";

@Injectable()
export class AdmissionPdfBuilder extends BasePdfBuilder {
  build(data: Record<string, any>): TDocumentDefinitions {
    const content: Content[] = [
      ...this.createHeader("INFORME DE ADMISIÓN"),
      {
        text: `Fecha de Admisión: ${this.formatDate(data.admissionDate)}`,
        style: "normal",
        marginBottom: 15,
      },
      this.createPatientInfo(data.patient),
      ...this.createTextSection("Fuente de Derivación", data.referralSource),
      ...this.createTextSection("Motivo de Derivación", data.referralReason),
      ...this.createTextSection(
        "Diagnóstico Principal",
        data.diagnosis?.primary
      ),
      ...this.createTextSection("Conclusiones", data.conclusions),
      this.createRecommendations(data.recommendations),
    ];

    return {
      content,
      styles: this.defaultStyles,
      defaultStyle: this.defaultStyle,
      footer: (currentPage, pageCount) =>
        this.createFooter(currentPage, pageCount),
    };
  }

  private createRecommendations(recommendations: any): Content {
    if (!recommendations) return { text: "" };

    return {
      table: {
        widths: ["*", "*"],
        body: [
          [{ text: "Recomendaciones", style: "tableHeader", colSpan: 2 }, {}],
          [
            "Tipo de Intervención:",
            recommendations.interventionType || "No especificado",
          ],
          ["Frecuencia:", recommendations.frequency || "No especificada"],
          ["Duración:", recommendations.duration || "No especificada"],
        ],
      },
      layout: "lightHorizontalLines",
      marginTop: 15,
    };
  }
}
