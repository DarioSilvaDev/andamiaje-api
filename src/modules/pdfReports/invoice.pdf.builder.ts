import { Injectable } from "@nestjs/common";
import { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import { BasePdfBuilder } from "./base.pdf.builder";

@Injectable()
export class InvoicePdfBuilder extends BasePdfBuilder {
  build(data: Record<string, any>): TDocumentDefinitions {
    const content: Content[] = [
      ...this.createHeader("FACTURA", `Nº ${data.invoiceNumber}`),
      {
        text: `Fecha: ${this.formatDate(data.invoiceDate)}`,
        style: "normal",
        marginBottom: 15,
      },
      this.createClientInfo(data.clientInfo),
      this.createItemsTable(data.items || []),
      this.createTotals(data),
      ...this.createTextSection("Notas", data.notes),
    ];

    return {
      content,
      styles: this.defaultStyles,
      defaultStyle: this.defaultStyle,
      footer: (currentPage, pageCount) =>
        this.createFooter(currentPage, pageCount),
    };
  }

  private createClientInfo(clientInfo: any): Content {
    if (!clientInfo) return { text: "" };

    return {
      table: {
        widths: ["*", "*"],
        body: [
          [{ text: "Información del Cliente", style: "tableHeader", colSpan: 2 }, {}],
          ["Nombre:", clientInfo.name || "No especificado"],
          ["Documento:", clientInfo.documentNumber || "No especificado"],
          ["Dirección:", clientInfo.address || "No especificada"],
          ["Teléfono:", clientInfo.phone || "No especificado"],
        ],
      },
      layout: "lightHorizontalLines",
      marginBottom: 15,
    };
  }

  private createItemsTable(items: any[]): Content {
    if (!items || items.length === 0) {
      return { text: "" } as any;
    }

    const tableBody = [
      [
        { text: "Descripción", style: "tableHeader" },
        { text: "Cant.", style: "tableHeader" },
        { text: "P. Unit.", style: "tableHeader" },
        { text: "Total", style: "tableHeader" },
      ],
      ...items.map((item) => [
        item.description || "",
        item.quantity || 0,
        `$${item.unitPrice?.toFixed(2) || "0.00"}`,
        `$${item.total?.toFixed(2) || "0.00"}`,
      ]),
    ];

    return [
      {
        text: "Detalle",
        style: "subheader",
        marginTop: 10,
      } as any,
      {
        table: {
          widths: ["*", "auto", "auto", "auto"],
          body: tableBody,
        },
        layout: "lightHorizontalLines",
        marginBottom: 15,
      } as any,
    ] as any;
  }

  private createTotals(data: any): Content {
    return {
      table: {
        widths: ["*", "auto"],
        body: [
          ["Subtotal:", `$${data.subtotal?.toFixed(2) || "0.00"}`],
          ["Descuentos:", `-$${data.discountTotal?.toFixed(2) || "0.00"}`],
          ["Impuestos:", `+$${data.taxTotal?.toFixed(2) || "0.00"}`],
          [
            { text: "TOTAL:", bold: true },
            { text: `$${data.total?.toFixed(2) || "0.00"}`, bold: true },
          ],
        ],
      },
      layout: "noBorders",
      alignment: "right",
      marginTop: 15,
      marginBottom: 15,
    };
  }
}

