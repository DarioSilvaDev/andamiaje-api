import { Injectable } from "@nestjs/common";
import { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import { BasePdfBuilder } from "./base.pdf.builder";

@Injectable()
export class ActasPdfBuilder extends BasePdfBuilder {
  build(data: Record<string, any>): TDocumentDefinitions {
    const content: Content[] = [
      ...this.createHeader("ACTA DE REUNIÓN", data.subject),
      this.createMeetingInfo(data),
      ...this.createTextSection("Agenda", data.agenda),
      this.createAttendeesTable(data.attendees || []),
      ...this.createTextSection("Decisiones Tomadas", data.decisions),
      ...this.createTextSection("Acuerdos", data.agreements),
      ...this.createTextSection("Próximos Pasos", data.nextSteps),
      ...this.createTextSection("Notas Adicionales", data.additionalNotes),
    ];

    // Agregar información del paciente si existe
    if (data.patient && data.patient.name) {
      content.push(this.createPatientInfo(data.patient));
    }

    return {
      content,
      styles: this.defaultStyles,
      defaultStyle: this.defaultStyle,
      footer: (currentPage, pageCount) =>
        this.createFooter(currentPage, pageCount),
    };
  }

  private createMeetingInfo(data: Record<string, any>): Content {
    return {
      table: {
        widths: ["*", "*"],
        body: [
          [
            { text: "Información de la Reunión", style: "tableHeader", colSpan: 2 },
            {},
          ],
          ["Modalidad:", data.modality || "No especificada"],
          ["Fecha:", this.formatDate(data.meetingDate)],
          ["Duración:", `${data.durationMinutes || 0} minutos`],
          [
            "Ubicación:",
            data.modality === "PRESENCIAL"
              ? data.location || "No especificada"
              : data.meetingUrl || "No especificada",
          ],
        ],
      },
      layout: "lightHorizontalLines",
      marginBottom: 15,
    };
  }

  private createAttendeesTable(attendees: any[]): Content {
    if (!attendees || attendees.length === 0) {
      return { text: "" } as any;
    }

    const tableBody = [
      [
        { text: "Nombre", style: "tableHeader" },
        { text: "Rol", style: "tableHeader" },
        { text: "Asistió", style: "tableHeader" },
        { text: "Firmó", style: "tableHeader" },
      ],
      ...attendees.map((attendee) => [
        attendee.name || "",
        attendee.role || "",
        attendee.attended ? "Sí" : "No",
        attendee.signature ? "Sí" : "No",
      ]),
    ];

    return [
      {
        text: "Asistentes",
        style: "subheader",
        marginTop: 10,
        marginBottom: 5,
      } as any,
      {
        table: {
          widths: ["*", "*", "auto", "auto"],
          body: tableBody,
        },
        layout: "lightHorizontalLines",
        marginBottom: 15,
      } as any,
    ] as any;
  }
}
