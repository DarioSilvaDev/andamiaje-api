import { Injectable, Logger } from "@nestjs/common";
import { PrinterService } from "./printer.service";
import { BaseForm } from "@/entities";
import { FORMTYPE } from "@/commons/enums";
import { ActasPdfBuilder } from "../pdfReports/actas.pdf.builder";
import { AdmissionPdfBuilder } from "../pdfReports/admission.pdf.builder";
import { PlanPdfBuilder } from "../pdfReports/plan.pdf.builder";
import { SemestralReportPdfBuilder } from "../pdfReports/semestral-report.pdf.builder";
import { MonthlyReportPdfBuilder } from "../pdfReports/monthly-report.pdf.builder";
import { AccompanimentPdfBuilder } from "../pdfReports/accompaniment.pdf.builder";
import { FamilyFollowUpPdfBuilder } from "../pdfReports/family-followup.pdf.builder";
import { InvoicePdfBuilder } from "../pdfReports/invoice.pdf.builder";

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  constructor(
    private readonly printerService: PrinterService,
    private readonly actasPdfBuilder: ActasPdfBuilder,
    private readonly admissionPdfBuilder: AdmissionPdfBuilder,
    private readonly planPdfBuilder: PlanPdfBuilder,
    private readonly semestralReportPdfBuilder: SemestralReportPdfBuilder,
    private readonly monthlyReportPdfBuilder: MonthlyReportPdfBuilder,
    private readonly accompanimentPdfBuilder: AccompanimentPdfBuilder,
    private readonly familyFollowUpPdfBuilder: FamilyFollowUpPdfBuilder,
    private readonly invoicePdfBuilder: InvoicePdfBuilder
  ) {}

  /**
   * Genera PDF para un formulario aprobado y lo almacena
   */
  async generateFormPdf(form: BaseForm): Promise<string> {
    try {
      this.logger.log(
        `Generando PDF para formulario ${form.id} de tipo ${form.type}`
      );

      // Obtener el builder apropiado según el tipo
      const docDefinition = await this.getDocDefinition(form);

      // Crear PDF usando PrinterService
      const pdfDoc = this.printerService.createPdf(docDefinition);

      // Generar nombre del archivo
      const fileName = this.generatePdfFileName(form);

      // Convertir el stream a buffer
      const pdfBuffer = await this.streamToBuffer(pdfDoc);

      // Por ahora, solo retornamos la ruta donde se debería guardar
      // TODO: Integrar con StorageService cuando esté listo
      const pdfPath = `pdfs/${form.type.toLowerCase()}/${fileName}`;

      this.logger.log(`PDF generado exitosamente: ${pdfPath}`);

      return pdfPath;
    } catch (error) {
      this.logger.error(`Error generando PDF: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtiene la definición del documento según el tipo de formulario
   */
  private async getDocDefinition(form: BaseForm): Promise<any> {
    const formData = form.getFormData();

    switch (form.type) {
      case FORMTYPE.ACTAS:
        return this.actasPdfBuilder.build(formData);

      case FORMTYPE.INFORME_ADMISION:
        return this.admissionPdfBuilder.build(formData);

      case FORMTYPE.PLAN_TRABAJO:
        return this.planPdfBuilder.build(formData);

      case FORMTYPE.INFORME_SEMESTRAL:
        return this.semestralReportPdfBuilder.build(formData);

      case FORMTYPE.REPORTE_MENSUAL:
        return this.monthlyReportPdfBuilder.build(formData);

      case FORMTYPE.SEGUIMIENTO_ACOMPANANTE:
        return this.accompanimentPdfBuilder.build(formData);

      case FORMTYPE.SEGUIMIENTO_FAMILIA:
        return this.familyFollowUpPdfBuilder.build(formData);

      case FORMTYPE.FACTURA:
        return this.invoicePdfBuilder.build(formData);

      default:
        throw new Error(
          `Tipo de formulario no soportado para PDF: ${form.type}`
        );
    }
  }

  /**
   * Genera nombre del archivo PDF
   */
  private generatePdfFileName(form: BaseForm): string {
    const date = new Date().toISOString().split("T")[0];
    const formType = form.type.toLowerCase().replace(/_/g, "-");
    const patientName =
      form.patientName
        ?.replace(/\s+/g, "-")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") || "sin-nombre";

    return `${formType}-${patientName}-${date}-${form.id.substring(0, 8)}.pdf`;
  }

  /**
   * Convierte stream a buffer
   */
  private streamToBuffer(stream: PDFKit.PDFDocument): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(chunks)));
      stream.on("error", reject);
      stream.end();
    });
  }
}
