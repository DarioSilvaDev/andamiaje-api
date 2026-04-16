import { Injectable } from "@nestjs/common";
import PdfPrinter from "pdfmake";
import { TDocumentDefinitions, BufferOptions } from "pdfmake/interfaces";

const fonts = {
  Roboto: {
    normal: "fonts/Roboto-Regular.ttf",
    bold: "fonts/Roboto-Medium.ttf",
    italics: "fonts/Roboto-Italic.ttf",
    bolditalics: "fonts/Roboto-MediumItalic.ttf",
  },
};

@Injectable()
export class PrinterService {
  private printer = new PdfPrinter(fonts);

  createPdf(
    docDefinition: TDocumentDefinitions,
    options: BufferOptions = {},
  ): PDFKit.PDFDocument {
    return this.printer.createPdfKitDocument(docDefinition, options);
  }

  async createPdfBuffer(
    docDefinition: TDocumentDefinitions,
    options: BufferOptions = {},
  ): Promise<Buffer> {
    const doc = this.createPdf(docDefinition, options);
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
      doc.end();
    });
  }
}
