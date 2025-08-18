import { Controller, Get, Res } from "@nestjs/common";
import { AppService } from "./app.service";
import { getActasPdfReport } from "./modules/pdfReports/actas.pdf.report";
import { Response } from "express";
import { PrinterService } from "./modules/printer/printer.service";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly printerService: PrinterService
  ) {}

  @Get("status")
  getStatus(@Res() response: Response) {
    const acta = getActasPdfReport();
    // Ensure the PDF template is loaded
    const doc = this.printerService.createPdf(acta);
    response.setHeader("Content-Type", "application/pdf");
    doc.info.Title = "Hola-Mundo";
    doc.pipe(response);
    doc.end();
    return acta; //this.appService.getStatus();
  }
}
