import { Module } from "@nestjs/common";
import { PrinterService } from "./printer.service";
import { PrinterController } from "./printer.controller";
import { PdfService } from "./pdf.service";
import { ActasPdfBuilder } from "../pdfReports/actas.pdf.builder";
import { AdmissionPdfBuilder } from "../pdfReports/admission.pdf.builder";
import { PlanPdfBuilder } from "../pdfReports/plan.pdf.builder";
import { SemestralReportPdfBuilder } from "../pdfReports/semestral-report.pdf.builder";
import { MonthlyReportPdfBuilder } from "../pdfReports/monthly-report.pdf.builder";
import { AccompanimentPdfBuilder } from "../pdfReports/accompaniment.pdf.builder";
import { FamilyFollowUpPdfBuilder } from "../pdfReports/family-followup.pdf.builder";
import { InvoicePdfBuilder } from "../pdfReports/invoice.pdf.builder";

@Module({
  imports: [],
  controllers: [PrinterController],
  providers: [
    PrinterService,
    PdfService,
    ActasPdfBuilder,
    AdmissionPdfBuilder,
    PlanPdfBuilder,
    SemestralReportPdfBuilder,
    MonthlyReportPdfBuilder,
    AccompanimentPdfBuilder,
    FamilyFollowUpPdfBuilder,
    InvoicePdfBuilder,
  ],
  exports: [PrinterService, PdfService],
})
export class PrinterModule {}
