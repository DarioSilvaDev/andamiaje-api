import { Entity, Column, Index } from "typeorm";
import { BaseForm } from "../base/base-form.entity";
import { FORMTYPE, MODALITY_ENUM } from "@/commons/enums";

@Entity("acta_forms_v2")
@Index(["modality", "meetingDate"])
export class ActaFormV2 extends BaseForm {
  @Column({ type: "enum", enum: MODALITY_ENUM })
  modality: MODALITY_ENUM;

  @Column({ type: "varchar", length: 200 })
  subject: string;

  @Column({ type: "text" })
  agenda: string;

  @Column({ type: "timestamp" })
  meetingDate: Date;

  @Column({ type: "int", default: 60 })
  durationMinutes: number;

  @Column({ type: "varchar", length: 100, nullable: true })
  location?: string;

  @Column({ type: "text", nullable: true })
  meetingUrl?: string;

  @Column({ type: "jsonb", nullable: true })
  attendees: {
    id: string;
    name: string;
    role: string;
    attended: boolean;
    signature?: string;
  }[];

  @Column({ type: "text" })
  decisions: string;

  @Column({ type: "text", nullable: true })
  agreements: string;

  @Column({ type: "text", nullable: true })
  nextSteps: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  nextMeetingDate?: string;

  @Column({ type: "text", nullable: true })
  additionalNotes?: string;

  // Constructor
  constructor() {
    super();
    this.type = FORMTYPE.ACTAS;
  }

  // Implementación de métodos abstractos
  async validate(): Promise<boolean> {
    if (!this.subject || this.subject.trim().length === 0) {
      throw new Error("El asunto de la reunión es obligatorio");
    }

    if (!this.agenda || this.agenda.trim().length === 0) {
      throw new Error("La agenda de la reunión es obligatoria");
    }

    if (!this.meetingDate) {
      throw new Error("La fecha de la reunión es obligatoria");
    }

    if (this.meetingDate > new Date()) {
      throw new Error("La fecha de la reunión no puede ser futura");
    }

    if (!this.decisions || this.decisions.trim().length === 0) {
      throw new Error("Las decisiones tomadas son obligatorias");
    }

    if (!this.attendees || this.attendees.length === 0) {
      throw new Error("Debe haber al menos un asistente");
    }

    if (this.modality === MODALITY_ENUM.VIRTUAL && !this.meetingUrl) {
      throw new Error(
        "La URL de la reunión es obligatoria para reuniones virtuales"
      );
    }

    return true;
  }

  getFormData(): Record<string, any> {
    return {
      type: this.type,
      title: this.title,
      modality: this.modality,
      subject: this.subject,
      agenda: this.agenda,
      meetingDate: this.meetingDate,
      durationMinutes: this.durationMinutes,
      location: this.location,
      meetingUrl: this.meetingUrl,
      attendees: this.attendees,
      decisions: this.decisions,
      agreements: this.agreements,
      nextSteps: this.nextSteps,
      nextMeetingDate: this.nextMeetingDate,
      additionalNotes: this.additionalNotes,
      patient: this.getPatientInfo(),
    };
  }

  setFormData(data: Record<string, any>): void {
    this.modality = data.modality;
    this.subject = data.subject;
    this.agenda = data.agenda;
    this.meetingDate = data.meetingDate
      ? new Date(data.meetingDate)
      : new Date();
    this.durationMinutes = data.durationMinutes || 60;
    this.location = data.location;
    this.meetingUrl = data.meetingUrl;
    this.attendees = data.attendees || [];
    this.decisions = data.decisions;
    this.agreements = data.agreements;
    this.nextSteps = data.nextSteps;
    this.nextMeetingDate = data.nextMeetingDate;
    this.additionalNotes = data.additionalNotes;

    // Actualizar título automáticamente
    this.title = this.generateTitle();
  }

  // Métodos específicos de ACTAS
  generateTitle(): string {
    const date = this.meetingDate.toLocaleDateString("es-ES");
    return `Acta - ${this.subject} - ${date}`;
  }

  addAttendee(attendee: {
    id: string;
    name: string;
    role: string;
    attended?: boolean;
  }): void {
    if (!this.attendees) {
      this.attendees = [];
    }

    const existingIndex = this.attendees.findIndex((a) => a.id === attendee.id);
    if (existingIndex >= 0) {
      this.attendees[existingIndex] = {
        ...this.attendees[existingIndex],
        ...attendee,
      };
    } else {
      this.attendees.push({
        ...attendee,
        attended: attendee.attended || false,
      });
    }
  }

  removeAttendee(attendeeId: string): void {
    if (!this.attendees) return;
    this.attendees = this.attendees.filter((a) => a.id !== attendeeId);
  }

  markAttendeePresent(attendeeId: string, signature?: string): void {
    if (!this.attendees) return;
    const attendee = this.attendees.find((a) => a.id === attendeeId);
    if (attendee) {
      attendee.attended = true;
      if (signature) {
        attendee.signature = signature;
      }
    }
  }

  getAttendanceSummary(): {
    total: number;
    present: number;
    absent: number;
    attendanceRate: number;
  } {
    if (!this.attendees || this.attendees.length === 0) {
      return { total: 0, present: 0, absent: 0, attendanceRate: 0 };
    }

    const total = this.attendees.length;
    const present = this.attendees.filter((a) => a.attended).length;
    const absent = total - present;
    const attendanceRate = total > 0 ? (present / total) * 100 : 0;

    return { total, present, absent, attendanceRate };
  }

  getSignedAttendees(): string[] {
    if (!this.attendees) return [];
    return this.attendees
      .filter((a) => a.attended && a.signature)
      .map((a) => a.name);
  }

  // Métodos de validación específicos
  validateMeetingDate(): boolean {
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    return this.meetingDate >= oneYearAgo && this.meetingDate <= today;
  }

  validateDuration(): boolean {
    return this.durationMinutes > 0 && this.durationMinutes <= 480; // Max 8 horas
  }

  validateAttendees(): boolean {
    if (!this.attendees || this.attendees.length === 0) return false;

    return this.attendees.every(
      (attendee) => attendee.id && attendee.name && attendee.role
    );
  }

  // Método para generar resumen del acta
  getSummary(): string {
    const attendance = this.getAttendanceSummary();
    const signedAttendees = this.getSignedAttendees();

    return `
      ACTA DE REUNIÓN
      Asunto: ${this.subject}
      Fecha: ${this.meetingDate.toLocaleDateString("es-ES")}
      Modalidad: ${this.modality}
      Duración: ${this.durationMinutes} minutos
      
      ASISTENCIA:
      Total: ${attendance.total}
      Presentes: ${attendance.present}
      Ausentes: ${attendance.absent}
      Tasa de asistencia: ${attendance.attendanceRate.toFixed(1)}%
      
      FIRMANTES: ${signedAttendees.join(", ")}
      
      DECISIONES:
      ${this.decisions}
      
      ${this.agreements ? `ACUERDOS:\n${this.agreements}` : ""}
      ${this.nextSteps ? `PRÓXIMOS PASOS:\n${this.nextSteps}` : ""}
    `.trim();
  }
}
