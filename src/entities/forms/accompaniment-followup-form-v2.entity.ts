import { Entity, Column, Index } from "typeorm";
import { BaseForm } from "../base/base-form.entity";
import { FORMTYPE } from "@/commons/enums";
import { BadRequestException } from "@nestjs/common";

@Entity("accompaniment_followup_forms_v2")
@Index(["periodStart", "periodEnd"])
export class AccompanimentFollowUpFormV2 extends BaseForm {
  // Información del acompañante
  @Column({ type: "jsonb" })
  accompanistInfo: {
    name: string;
    documentNumber: string;
    relationshipToPatient: string;
    contactInfo: {
      phone: string;
      email: string;
      address: string;
    };
  };

  // Periodo de seguimiento
  @Column({ type: "date" })
  periodStart: Date;

  @Column({ type: "date" })
  periodEnd: Date;

  // Actividades de acompañamiento
  @Column({ type: "jsonb" })
  accompanimentActivities: Array<{
    date: Date;
    type: string;
    description: string;
    location: string;
    duration: number;
    observations: string;
  }>;

  // Evaluación del acompañamiento
  @Column({ type: "jsonb" })
  evaluation: {
    commitment: {
      score: number;
      description: string;
    };
    effectiveness: {
      score: number;
      description: string;
    };
    communication: {
      score: number;
      description: string;
    };
    relationshipWithPatient: {
      score: number;
      description: string;
    };
  };

  // Observaciones
  @Column({ type: "jsonb", nullable: true })
  strengths: string[];

  @Column({ type: "jsonb", nullable: true })
  areasForImprovement: string[];

  @Column({ type: "jsonb", nullable: true })
  challenges: string[];

  @Column({ type: "jsonb", nullable: true })
  successStories: string[];

  // Coordinación
  @Column({ type: "jsonb", nullable: true })
  coordinationWithTeam: {
    frequency: string;
    quality: "HIGH" | "MEDIUM" | "LOW";
    observations: string;
  };

  // Recomendaciones
  @Column({ type: "text" })
  recommendationsText: string;

  @Column({ type: "jsonb", nullable: true })
  trainingNeeds: string[];

  @Column({ type: "text", nullable: true })
  supportRequired?: string;

  // Constructor
  constructor() {
    super();
    this.type = FORMTYPE.SEGUIMIENTO_ACOMPANANTE;
  }

  // Implementación de métodos abstractos
  async validate(): Promise<boolean> {
    // Validar información del acompañante
    if (!this.accompanistInfo || !this.accompanistInfo.name) {
      throw new BadRequestException(
        "La información del acompañante es obligatoria"
      );
    }

    // Validar periodo
    if (!this.periodStart || !this.periodEnd) {
      throw new BadRequestException(
        "Las fechas del periodo de seguimiento son obligatorias"
      );
    }

    if (this.periodEnd <= this.periodStart) {
      throw new BadRequestException(
        "La fecha de fin debe ser posterior a la fecha de inicio"
      );
    }

    // Validar actividades
    if (
      !this.accompanimentActivities ||
      this.accompanimentActivities.length === 0
    ) {
      throw new BadRequestException(
        "Debe registrarse al menos una actividad de acompañamiento"
      );
    }

    // Validar evaluaciones (scores entre 1 y 10)
    if (this.evaluation) {
      const scores = [
        this.evaluation.commitment?.score,
        this.evaluation.effectiveness?.score,
        this.evaluation.communication?.score,
        this.evaluation.relationshipWithPatient?.score,
      ];

      for (const score of scores) {
        if (score && (score < 1 || score > 10)) {
          throw new BadRequestException(
            "Los puntajes de evaluación deben estar entre 1 y 10"
          );
        }
      }
    }

    // Validar recomendaciones
    if (
      !this.recommendationsText ||
      this.recommendationsText.trim().length === 0
    ) {
      throw new BadRequestException("Las recomendaciones son obligatorias");
    }

    return true;
  }

  getFormData(): Record<string, any> {
    return {
      type: this.type,
      title: this.title,
      accompanistInfo: this.accompanistInfo,
      periodStart: this.periodStart,
      periodEnd: this.periodEnd,
      accompanimentActivities: this.accompanimentActivities,
      evaluation: this.evaluation,
      strengths: this.strengths,
      areasForImprovement: this.areasForImprovement,
      challenges: this.challenges,
      successStories: this.successStories,
      coordinationWithTeam: this.coordinationWithTeam,
      recommendations: this.recommendationsText,
      trainingNeeds: this.trainingNeeds,
      supportRequired: this.supportRequired,
      patient: this.getPatientInfo(),
    };
  }

  setFormData(data: Record<string, any>): void {
    this.periodStart = data.periodStart
      ? new Date(data.periodStart)
      : new Date();
    this.periodEnd = data.periodEnd ? new Date(data.periodEnd) : new Date();
    this.accompanistInfo = data.accompanistInfo;
    this.accompanimentActivities = data.accompanimentActivities || [];
    this.evaluation = data.evaluation;
    this.strengths = data.strengths || [];
    this.areasForImprovement = data.areasForImprovement || [];
    this.challenges = data.challenges || [];
    this.successStories = data.successStories || [];
    this.coordinationWithTeam = data.coordinationWithTeam;
    this.recommendationsText = data.recommendations;
    this.trainingNeeds = data.trainingNeeds || [];
    this.supportRequired = data.supportRequired;

    // Actualizar título automáticamente
    this.title = this.generateTitle();
  }

  // Métodos específicos del Seguimiento de Acompañante
  generateTitle(): string {
    const accompanistName = this.accompanistInfo?.name || "Acompañante";
    const date = this.periodStart
      ? this.periodStart.toLocaleDateString("es-ES")
      : new Date().toLocaleDateString("es-ES");
    return `Seguimiento Acompañante - ${accompanistName} - ${date}`;
  }

  getAverageScore(): number {
    if (!this.evaluation) return 0;

    const scores = [
      this.evaluation.commitment?.score || 0,
      this.evaluation.effectiveness?.score || 0,
      this.evaluation.communication?.score || 0,
      this.evaluation.relationshipWithPatient?.score || 0,
    ];

    const total = scores.reduce((acc, score) => acc + score, 0);
    return total / scores.length;
  }

  getTotalActivities(): number {
    return this.accompanimentActivities?.length || 0;
  }

  getTotalHours(): number {
    if (!this.accompanimentActivities) return 0;
    return this.accompanimentActivities.reduce(
      (total, activity) => total + (activity.duration || 0),
      0
    );
  }

  getPerformanceLevel(): string {
    const avgScore = this.getAverageScore();
    if (avgScore >= 8) return "Excelente";
    if (avgScore >= 6) return "Bueno";
    if (avgScore >= 4) return "Regular";
    return "Necesita apoyo";
  }

  // Método para generar resumen
  getSummary(): string {
    const avgScore = this.getAverageScore();
    const performanceLevel = this.getPerformanceLevel();

    return `
      SEGUIMIENTO DE ACOMPAÑANTE
      
      ACOMPAÑANTE: ${this.accompanistInfo?.name}
      PERIODO: ${this.periodStart.toLocaleDateString("es-ES")} - ${this.periodEnd.toLocaleDateString("es-ES")}
      
      PACIENTE: ${this.patientName}
      
      ACTIVIDADES REALIZADAS: ${this.getTotalActivities()}
      HORAS TOTALES: ${this.getTotalHours()}
      
      EVALUACIÓN:
      Puntuación Promedio: ${avgScore.toFixed(1)}/10
      Nivel de Desempeño: ${performanceLevel}
      
      FORTALEZAS: ${this.strengths?.length || 0}
      ÁREAS DE MEJORA: ${this.areasForImprovement?.length || 0}
      DESAFÍOS: ${this.challenges?.length || 0}
      
      RECOMENDACIONES:
      ${this.recommendationsText}
    `.trim();
  }
}

