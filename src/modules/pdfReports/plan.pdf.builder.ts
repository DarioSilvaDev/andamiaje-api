import { Injectable } from "@nestjs/common";
import { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import { BasePdfBuilder } from "./base.pdf.builder";

@Injectable()
export class PlanPdfBuilder extends BasePdfBuilder {
  build(data: Record<string, any>): TDocumentDefinitions {
    const content: Content[] = [
      ...this.createHeader("PLAN DE TRABAJO TERAPÉUTICO"),
      {
        text: `Periodo: ${this.formatDate(data.startDate)} - ${this.formatDate(data.endDate)}`,
        style: "normal",
        marginBottom: 15,
      },
      this.createPatientInfo(data.patient),
      this.createObjectivesSection(
        data.generalObjectives,
        "Objetivos Generales"
      ),
      this.createObjectivesSection(
        data.specificObjectives,
        "Objetivos Específicos"
      ),
      ...this.createTextSection("Metodología", data.methodology?.approach),
      ...this.createTextSection("Método de Evaluación", data.evaluationMethod),
      ...this.createTextSection("Observaciones", data.observations),
    ];

    return {
      content,
      styles: this.defaultStyles,
      defaultStyle: this.defaultStyle,
      footer: (currentPage, pageCount) =>
        this.createFooter(currentPage, pageCount),
    };
  }

  private createObjectivesSection(objectives: any[], title: string): Content {
    if (!objectives || objectives.length === 0) {
      return { text: "" } as any;
    }

    return [
      {
        text: title,
        style: "subheader",
        marginTop: 10,
      } as any,
      {
        ul: objectives.map((obj) => obj.description),
        marginBottom: 10,
      } as any,
    ] as any;
  }
}
