import { Entity, Column, Index } from "typeorm";
import { BaseForm } from "../base/base-form.entity";
import { FORMTYPE } from "@/commons/enums";
import { BadRequestException } from "@nestjs/common";

@Entity("semestral_report_forms_v2")
@Index(["periodStart", "periodEnd"])
@Index(["semester", "year"])
export class SemestralReportFormV2 extends BaseForm {
  @Column({ type: "date" })
  periodStart: Date;

  @Column({ type: "date" })
  periodEnd: Date;

  @Column({ type: "int" })
  semester: number; // 1 o 2

  @Column({ type: "int" })
  year: number;

  @Column({ type: "text" })
  executiveSummary: string;

  // Evaluación de objetivos
  @Column({ type: "jsonb" })
  objectivesEvaluation: Array<{
    objectiveId: string;
    description: string;
    initialStatus: string;
    currentStatus: "ACHIEVED" | "IN_PROGRESS" | "NOT_ACHIEVED";
    progressPercentage: number;
    evidence: string;
    observations: string;
  }>;

  // Áreas evaluadas
  @Column({ type: "jsonb" })
  areasEvaluation: {
    communication: {
      score: number;
      description: string;
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
    };
    cognition: {
      score: number;
      description: string;
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
    };
    socialSkills: {
      score: number;
      description: string;
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
    };
    autonomy: {
      score: number;
      description: string;
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
    };
  };

  // Sesiones realizadas
  @Column({ type: "jsonb" })
  sessionsInfo: {
    planned: number;
    completed: number;
    cancelled: number;
    attendanceRate: number;
    cancellationReasons: string[];
  };

  // Metodología aplicada
  @Column({ type: "jsonb", nullable: true })
  methodologyUsed: {
    techniques: string[];
    materials: string[];
    adaptations: string;
  };

  // Participación familiar
  @Column({ type: "jsonb", nullable: true })
  familyParticipation: {
    level: "HIGH" | "MEDIUM" | "LOW";
    description: string;
    observations: string;
  };

  // Conclusiones y recomendaciones
  @Column({ type: "text" })
  conclusions: string;

  @Column({ type: "text" })
  recommendationsText: string;

  @Column({ type: "text", nullable: true })
  proposedAdjustments?: string;

  // Próximos pasos
  @Column({ type: "text", nullable: true })
  nextSteps?: string;

  @Column({ type: "boolean", default: false })
  requiresPlanAdjustment: boolean;

  @Column({ type: "varchar", length: 100, nullable: true })
  suggestedFrequency?: string;

  // Constructor
  constructor() {
    super();
    this.type = FORMTYPE.INFORME_SEMESTRAL;
  }

  // Implementación de métodos abstractos
  async validate(): Promise<boolean> {
    // Validar periodo
    if (!this.periodStart || !this.periodEnd) {
      throw new BadRequestException(
        "Las fechas de inicio y fin del periodo son obligatorias"
      );
    }

    if (this.periodEnd <= this.periodStart) {
      throw new BadRequestException(
        "La fecha de fin debe ser posterior a la fecha de inicio"
      );
    }

    // Validar resumen ejecutivo
    if (!this.executiveSummary || this.executiveSummary.trim().length === 0) {
      throw new BadRequestException("El resumen ejecutivo es obligatorio");
    }

    // Validar conclusiones y recomendaciones
    if (!this.conclusions || this.conclusions.trim().length === 0) {
      throw new BadRequestException("Las conclusiones son obligatorias");
    }

    if (
      !this.recommendationsText ||
      this.recommendationsText.trim().length === 0
    ) {
      throw new BadRequestException("Las recomendaciones son obligatorias");
    }

    // Validar evaluación de objetivos
    if (!this.objectivesEvaluation || this.objectivesEvaluation.length === 0) {
      throw new BadRequestException("Debe evaluarse al menos un objetivo");
    }

    // Validar áreas evaluadas
    if (!this.areasEvaluation) {
      throw new BadRequestException("La evaluación de áreas es obligatoria");
    }

    // Validar scores de áreas (deben estar entre 1 y 10)
    const areas = [
      this.areasEvaluation.communication,
      this.areasEvaluation.cognition,
      this.areasEvaluation.socialSkills,
      this.areasEvaluation.autonomy,
    ];

    for (const area of areas) {
      if (area && (area.score < 1 || area.score > 10)) {
        throw new BadRequestException(
          "Los puntajes de las áreas deben estar entre 1 y 10"
        );
      }
    }

    // Validar datos del paciente
    if (!this.patientName || !this.patientDocumentNumber) {
      throw new BadRequestException(
        "Los datos del paciente son obligatorios para el informe semestral"
      );
    }

    return true;
  }

  getFormData(): Record<string, any> {
    return {
      type: this.type,
      title: this.title,
      periodStart: this.periodStart,
      periodEnd: this.periodEnd,
      semester: this.semester,
      year: this.year,
      executiveSummary: this.executiveSummary,
      objectivesEvaluation: this.objectivesEvaluation,
      areasEvaluation: this.areasEvaluation,
      sessionsInfo: this.sessionsInfo,
      methodologyUsed: this.methodologyUsed,
      familyParticipation: this.familyParticipation,
      conclusions: this.conclusions,
      recommendations: this.recommendationsText,
      proposedAdjustments: this.proposedAdjustments,
      nextSteps: this.nextSteps,
      requiresPlanAdjustment: this.requiresPlanAdjustment,
      suggestedFrequency: this.suggestedFrequency,
      patient: this.getPatientInfo(),
    };
  }

  setFormData(data: Record<string, any>): void {
    this.periodStart = data.periodStart
      ? new Date(data.periodStart)
      : new Date();
    this.periodEnd = data.periodEnd ? new Date(data.periodEnd) : new Date();
    this.semester = data.semester || 1;
    this.year = data.year || new Date().getFullYear();
    this.executiveSummary = data.executiveSummary;
    this.objectivesEvaluation = data.objectivesEvaluation || [];
    this.areasEvaluation = data.areasEvaluation;
    this.sessionsInfo = data.sessionsInfo;
    this.methodologyUsed = data.methodologyUsed;
    this.familyParticipation = data.familyParticipation;
    this.conclusions = data.conclusions;
    this.recommendationsText = data.recommendations;
    this.proposedAdjustments = data.proposedAdjustments;
    this.nextSteps = data.nextSteps;
    this.requiresPlanAdjustment = data.requiresPlanAdjustment || false;
    this.suggestedFrequency = data.suggestedFrequency;

    // Actualizar título automáticamente
    this.title = this.generateTitle();
  }

  // Métodos específicos del Informe Semestral
  generateTitle(): string {
    const patientName = this.patientName || "Sin paciente";
    return `Informe Semestral ${this.semester}/${this.year} - ${patientName}`;
  }

  getOverallScore(): number {
    if (!this.areasEvaluation) return 0;

    const scores = [
      this.areasEvaluation.communication?.score || 0,
      this.areasEvaluation.cognition?.score || 0,
      this.areasEvaluation.socialSkills?.score || 0,
      this.areasEvaluation.autonomy?.score || 0,
    ];

    const total = scores.reduce((acc, score) => acc + score, 0);
    return total / scores.length;
  }

  getAttendanceRate(): number {
    if (!this.sessionsInfo) return 0;
    return this.sessionsInfo.attendanceRate || 0;
  }

  getAchievedObjectivesPercentage(): number {
    if (!this.objectivesEvaluation || this.objectivesEvaluation.length === 0) {
      return 0;
    }

    const achieved = this.objectivesEvaluation.filter(
      (obj) => obj.currentStatus === "ACHIEVED"
    ).length;
    return (achieved / this.objectivesEvaluation.length) * 100;
  }

  getInProgressObjectivesCount(): number {
    return (
      this.objectivesEvaluation?.filter(
        (obj) => obj.currentStatus === "IN_PROGRESS"
      ).length || 0
    );
  }

  getNotAchievedObjectivesCount(): number {
    return (
      this.objectivesEvaluation?.filter(
        (obj) => obj.currentStatus === "NOT_ACHIEVED"
      ).length || 0
    );
  }

  getAreaScoreSummary(): {
    area: string;
    score: number;
    level: string;
  }[] {
    if (!this.areasEvaluation) return [];

    const getLevel = (score: number): string => {
      if (score >= 8) return "Excelente";
      if (score >= 6) return "Bueno";
      if (score >= 4) return "Regular";
      return "Necesita apoyo";
    };

    return [
      {
        area: "Comunicación",
        score: this.areasEvaluation.communication?.score || 0,
        level: getLevel(this.areasEvaluation.communication?.score || 0),
      },
      {
        area: "Cognición",
        score: this.areasEvaluation.cognition?.score || 0,
        level: getLevel(this.areasEvaluation.cognition?.score || 0),
      },
      {
        area: "Habilidades Sociales",
        score: this.areasEvaluation.socialSkills?.score || 0,
        level: getLevel(this.areasEvaluation.socialSkills?.score || 0),
      },
      {
        area: "Autonomía",
        score: this.areasEvaluation.autonomy?.score || 0,
        level: getLevel(this.areasEvaluation.autonomy?.score || 0),
      },
    ];
  }

  // Método para generar resumen del informe
  getSummary(): string {
    const overallScore = this.getOverallScore();
    const attendanceRate = this.getAttendanceRate();
    const achievedPercentage = this.getAchievedObjectivesPercentage();

    return `
      INFORME SEMESTRAL ${this.semester}/${this.year}
      
      PACIENTE: ${this.patientName}
      PERIODO: ${this.periodStart.toLocaleDateString("es-ES")} - ${this.periodEnd.toLocaleDateString("es-ES")}
      
      RESUMEN EJECUTIVO:
      ${this.executiveSummary}
      
      PUNTUACIÓN GLOBAL: ${overallScore.toFixed(1)}/10
      ASISTENCIA: ${attendanceRate.toFixed(1)}%
      OBJETIVOS LOGRADOS: ${achievedPercentage.toFixed(1)}%
      
      SESIONES:
      Planificadas: ${this.sessionsInfo?.planned || 0}
      Realizadas: ${this.sessionsInfo?.completed || 0}
      Canceladas: ${this.sessionsInfo?.cancelled || 0}
      
      CONCLUSIONES:
      ${this.conclusions}
      
      RECOMENDACIONES:
      ${this.recommendationsText}
    `.trim();
  }
}
