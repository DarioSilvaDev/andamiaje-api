import { Injectable } from "@nestjs/common";
import { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import { BasePdfBuilder } from "./base.pdf.builder";

@Injectable()
export class MonthlyReportPdfBuilder extends BasePdfBuilder {
  build(data: Record<string, any>): TDocumentDefinitions {
    const monthNames = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    const monthName = monthNames[data.month - 1] || "Mes";

    const content: Content[] = [
      ...this.createHeader("REPORTE MENSUAL", `${monthName} ${data.year}`),
      this.createPatientInfo(data.patient),
      ...this.createTextSection("Resumen del Mes", data.monthlySummary),
      ...this.createList("Logros", data.progress?.achievements),
      ...this.createList("Dificultades", data.progress?.difficulties),
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
