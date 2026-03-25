import { Entity, Column, Index } from "typeorm";
import { BaseForm } from "../base/base-form.entity";
import { FORMTYPE } from "@/commons/enums";
import { BadRequestException } from "@nestjs/common";

@Entity("monthly_report_forms_v2")
@Index(["month", "year"])
@Index(["periodStart", "periodEnd"])
export class MonthlyReportFormV2 extends BaseForm {
  @Column({ type: "int" })
  month: number; // 1-12

  @Column({ type: "int" })
  year: number;

  @Column({ type: "date" })
  periodStart: Date;

  @Column({ type: "date" })
  periodEnd: Date;

  @Column({ type: "text" })
  monthlySummary: string;

  // Actividades realizadas
  @Column({ type: "jsonb" })
  activities: Array<{
    date: Date;
    type: string;
    description: string;
    duration: number;
    participants: string[];
    observations: string;
  }>;

  // Progreso observado
  @Column({ type: "jsonb" })
  progress: {
    achievements: string[];
    difficulties: string[];
    emergingSkills: string[];
    areasOfConcern: string[];
  };

  // Asistencia
  @Column({ type: "jsonb" })
  attendance: {
    plannedSessions: number;
    attendedSessions: number;
    missedSessions: number;
    attendanceRate: number;
    missedReasons: string[];
  };

  // Comportamiento
  @Column({ type: "jsonb", nullable: true })
  behavior: {
    mood: string;
    motivation: "HIGH" | "MEDIUM" | "LOW";
    cooperation: "HIGH" | "MEDIUM" | "LOW";
    significantBehaviors: string[];
  };

  // Participación familiar
  @Column({ type: "jsonb", nullable: true })
  familyInvolvement: {
    level: "HIGH" | "MEDIUM" | "LOW";
    activities: string[];
    feedback: string;
  };

  // Observaciones específicas
  @Column({ type: "text", nullable: true })
  observations?: string;

  @Column({ type: "jsonb", nullable: true })
  incidents: string[];

  @Column({ type: "jsonb", nullable: true })
  celebrations: string[];

  // Próximo mes
  @Column({ type: "text", nullable: true })
  nextMonthPlanning?: string;

  @Column({ type: "text", nullable: true })
  recommendationsText?: string;

  // Constructor
  constructor() {
    super();
    this.type = FORMTYPE.REPORTE_MENSUAL;
  }

  // Implementación de métodos abstractos
  async validate(): Promise<boolean> {
    // Validar mes y año
    if (!this.month || this.month < 1 || this.month > 12) {
      throw new BadRequestException("El mes debe ser un número entre 1 y 12");
    }

    if (!this.year || this.year < 2000 || this.year > 2100) {
      throw new BadRequestException("El año no es válido");
    }

    // Validar resumen mensual
    if (!this.monthlySummary || this.monthlySummary.trim().length === 0) {
      throw new BadRequestException("El resumen mensual es obligatorio");
    }

    // Validar actividades
    if (!this.activities || this.activities.length === 0) {
      throw new BadRequestException("Debe registrarse al menos una actividad");
    }

    // Validar progreso
    if (
      !this.progress ||
      !this.progress.achievements ||
      this.progress.achievements.length === 0
    ) {
      throw new BadRequestException(
        "Debe registrarse al menos un logro en el progreso"
      );
    }

    // Validar información de asistencia
    if (!this.attendance) {
      throw new BadRequestException(
        "La información de asistencia es obligatoria"
      );
    }

    return true;
  }

  getFormData(): Record<string, any> {
    return {
      type: this.type,
      title: this.title,
      month: this.month,
      year: this.year,
      periodStart: this.periodStart,
      periodEnd: this.periodEnd,
      monthlySummary: this.monthlySummary,
      activities: this.activities,
      progress: this.progress,
      attendance: this.attendance,
      behavior: this.behavior,
      familyInvolvement: this.familyInvolvement,
      observations: this.observations,
      incidents: this.incidents,
      celebrations: this.celebrations,
      nextMonthPlanning: this.nextMonthPlanning,
      recommendations: this.recommendationsText,
      patient: this.getPatientInfo(),
    };
  }

  setFormData(data: Record<string, any>): void {
    this.month = data.month;
    this.year = data.year;
    this.periodStart = data.periodStart
      ? new Date(data.periodStart)
      : new Date();
    this.periodEnd = data.periodEnd ? new Date(data.periodEnd) : new Date();
    this.monthlySummary = data.monthlySummary;
    this.activities = data.activities || [];
    this.progress = data.progress;
    this.attendance = data.attendance;
    this.behavior = data.behavior;
    this.familyInvolvement = data.familyInvolvement;
    this.observations = data.observations;
    this.incidents = data.incidents || [];
    this.celebrations = data.celebrations || [];
    this.nextMonthPlanning = data.nextMonthPlanning;
    this.recommendationsText = data.recommendations;

    // Actualizar título automáticamente
    this.title = this.generateTitle();
  }

  // Métodos específicos del Reporte Mensual
  generateTitle(): string {
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
    const monthName = monthNames[this.month - 1] || "Mes";
    const patientName = this.patientName || "Sin paciente";
    return `Reporte Mensual - ${monthName} ${this.year} - ${patientName}`;
  }

  getTotalActivities(): number {
    return this.activities?.length || 0;
  }

  getTotalActivityHours(): number {
    if (!this.activities) return 0;
    return this.activities.reduce(
      (total, activity) => total + (activity.duration || 0),
      0
    );
  }

  getAttendanceRate(): number {
    return this.attendance?.attendanceRate || 0;
  }

  getAchievementsCount(): number {
    return this.progress?.achievements?.length || 0;
  }

  getDifficultiesCount(): number {
    return this.progress?.difficulties?.length || 0;
  }

  hasIncidents(): boolean {
    return this.incidents && this.incidents.length > 0;
  }

  hasCelebrations(): boolean {
    return this.celebrations && this.celebrations.length > 0;
  }

  // Método para generar resumen del reporte
  getSummary(): string {
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
    const monthName = monthNames[this.month - 1];

    return `
      REPORTE MENSUAL - ${monthName.toUpperCase()} ${this.year}
      
      PACIENTE: ${this.patientName}
      PERIODO: ${this.periodStart.toLocaleDateString("es-ES")} - ${this.periodEnd.toLocaleDateString("es-ES")}
      
      RESUMEN:
      ${this.monthlySummary}
      
      ACTIVIDADES: ${this.getTotalActivities()}
      HORAS TOTALES: ${this.getTotalActivityHours()}
      
      ASISTENCIA:
      Planificadas: ${this.attendance?.plannedSessions || 0}
      Asistidas: ${this.attendance?.attendedSessions || 0}
      Perdidas: ${this.attendance?.missedSessions || 0}
      Tasa de Asistencia: ${this.getAttendanceRate().toFixed(1)}%
      
      LOGROS: ${this.getAchievementsCount()}
      DIFICULTADES: ${this.getDifficultiesCount()}
      
      ${this.recommendationsText ? `RECOMENDACIONES:\n${this.recommendationsText}` : ""}
    `.trim();
  }
}
