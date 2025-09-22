import { Controller, Get, Res } from "@nestjs/common";
import { AppService } from "./app.service";
// import { buildActa } from "./modules/pdfReports/actas.pdf.builder";
import { Response } from "express";
import { PrinterService } from "./modules/printer/printer.service";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly printerService: PrinterService
  ) {}

  @Get()
  getStatus(@Res() response: Response) {
    return response.status(200).send("ONLINE");
  }

  // @Get("status")
  // getStatus(@Res() response: Response) {
  //   const acta = buildActa({}, {});
  //   // Ensure the PDF template is loaded
  //   /*
  //   let builder;
  //   switch (tipo) {
  //     case "ACTA":
  //       builder= buildActa(payload, configFromDB);
  //       break;
  //     case "INFORME":
  //       builder= buildInformeSemanal(payload, configFromDB);
  //       break;
  //     case "PLAN":
  //       builder= buildPlan(payload, configFromDB);
  //       break;
  //     }
  //   const doc = this.printerService.createPdf(builder);
  //   */
  //   const doc = this.printerService.createPdf(acta);
  //   response.setHeader("Content-Type", "application/pdf");
  //   doc.info.Title = "Hola-Mundo";
  //   doc.pipe(response);
  //   doc.end();
  //   return acta; //this.appService.getStatus();
  // }
}
