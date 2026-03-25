import { Content, TDocumentDefinitions } from "pdfmake/interfaces";

export abstract class BasePdfBuilder {
  protected logo: Content = {
    image: "./icon/LogotipoFinalWEBJPEG.jpg",
    width: 250,
    alignment: "center",
  };

  protected defaultStyles = {
    header: {
      fontSize: 18,
      bold: true,
      marginBottom: 15,
    },
    subheader: {
      fontSize: 14,
      bold: true,
      marginTop: 10,
      marginBottom: 5,
    },
    normal: {
      fontSize: 11,
      marginBottom: 5,
    },
    small: {
      fontSize: 9,
      color: "#666666",
    },
    tableHeader: {
      bold: true,
      fontSize: 11,
      color: "black",
      fillColor: "#eeeeee",
    },
  };

  protected defaultStyle = {
    font: "Roboto",
    fontSize: 11,
  };

  /**
   * Método abstracto que debe ser implementado por cada builder
   */
  abstract build(data: Record<string, any>): TDocumentDefinitions;

  /**
   * Método auxiliar para crear encabezado común
   */
  protected createHeader(title: string, subtitle?: string): Content[] {
    const content: Content[] = [
      {
        image: (this.logo as any).image,
        width: (this.logo as any).width,
        alignment: (this.logo as any).alignment,
        margin: [-20, -80, 0, 20],
      } as any,
      {
        text: title,
        style: "header",
        alignment: "center",
      } as any,
    ];

    if (subtitle) {
      content.push({
        text: subtitle,
        style: "subheader",
        alignment: "center",
        marginBottom: 20,
      } as any);
    }

    return content;
  }

  /**
   * Método auxiliar para información del paciente
   */
  protected createPatientInfo(patient: any): Content {
    if (!patient || !patient.name) {
      return { text: "" };
    }

    return {
      table: {
        widths: ["*", "*"],
        body: [
          [
            { text: "Información del Paciente", style: "tableHeader", colSpan: 2 },
            {},
          ],
          ["Nombre:", patient.name || "No especificado"],
          ["Documento:", patient.documentNumber || "No especificado"],
          ["Edad:", patient.age ? `${patient.age} años` : "No especificado"],
          [
            "Fecha de Nacimiento:",
            patient.birthDate
              ? new Date(patient.birthDate).toLocaleDateString("es-ES")
              : "No especificada",
          ],
          ["Diagnóstico:", patient.diagnosis || "No especificado"],
        ],
      },
      layout: "lightHorizontalLines",
      marginBottom: 15,
    };
  }

  /**
   * Método auxiliar para pie de página
   */
  protected createFooter(currentPage: number, pageCount: number): Content {
    return {
      text: `Página ${currentPage} de ${pageCount}`,
      alignment: "center",
      fontSize: 9,
      margin: [0, 10, 0, 0],
    };
  }

  /**
   * Método auxiliar para formatear fechas
   */
  protected formatDate(date: Date | string): string {
    if (!date) return "No especificada";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  /**
   * Método auxiliar para crear sección de texto
   */
  protected createTextSection(title: string, content: string): Content[] {
    return [
      { text: title, style: "subheader" },
      { text: content || "No especificado", style: "normal", marginBottom: 10 },
    ];
  }

  /**
   * Método auxiliar para crear lista
   */
  protected createList(title: string, items: string[]): Content[] {
    if (!items || items.length === 0) {
      return [];
    }

    return [
      { text: title, style: "subheader" },
      {
        ul: items,
        style: "normal",
        marginBottom: 10,
      },
    ];
  }
}

