import { Entity, Column, Index } from "typeorm";
import { BaseForm } from "../base/base-form.entity";
import { FORMTYPE, MODALITY_ENUM } from "@/commons/enums";
import { BadRequestException } from "@nestjs/common";

@Entity("plan_forms_v2")
@Index(["startDate", "endDate"])
export class PlanFormV2 extends BaseForm {
  @Column({ type: "date" })
  startDate: Date;

  @Column({ type: "date" })
  endDate: Date;

  @Column({ type: "int" })
  duration: number; // Duración en meses

  @Column({ type: "enum", enum: MODALITY_ENUM, nullable: true })
  modality?: MODALITY_ENUM;

  // Objetivos terapéuticos
  @Column({ type: "jsonb" })
  generalObjectives: Array<{
    id: string;
    description: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    indicators: string;
    status: "PENDING" | "IN_PROGRESS" | "ACHIEVED";
  }>;

  @Column({ type: "jsonb" })
  specificObjectives: Array<{
    id: string;
    description: string;
    generalObjectiveId: string;
    expectedOutcome: string;
    evaluationCriteria: string;
    deadline: Date;
    status: "PENDING" | "IN_PROGRESS" | "ACHIEVED";
  }>;

  // Metodología
  @Column({ type: "jsonb" })
  methodology: {
    approach: string;
    techniques: string[];
    materials: string[];
    frequency: string;
    sessionDuration: number;
  };

  // Cronograma
  @Column({ type: "jsonb", nullable: true })
  schedule: Array<{
    month: number;
    activities: string[];
    objectives: string[];
    evaluation: string;
  }>;

  // Evaluación
  @Column({ type: "text" })
  evaluationMethod: string;

  @Column({ type: "varchar", length: 100 })
  evaluationFrequency: string;

  @Column({ type: "jsonb", nullable: true })
  progressIndicators: string[];

  // Recursos
  @Column({ type: "jsonb", nullable: true })
  humanResources: Array<{
    role: string;
    name: string;
    responsibilities: string;
  }>;

  @Column({ type: "jsonb", nullable: true })
  materialResources: string[];

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  estimatedBudget?: number;

  // Observaciones
  @Column({ type: "text", nullable: true })
  observations?: string;

  @Column({ type: "text", nullable: true })
  recommendationsText?: string;

  // Constructor
  constructor() {
    super();
    this.type = FORMTYPE.PLAN_TRABAJO;
  }

  // Implementación de métodos abstractos
  async validate(): Promise<boolean> {
    // Validar fechas
    if (!this.startDate || !this.endDate) {
      throw new BadRequestException(
        "Las fechas de inicio y fin son obligatorias"
      );
    }

    if (this.endDate <= this.startDate) {
      throw new BadRequestException(
        "La fecha de fin debe ser posterior a la fecha de inicio"
      );
    }

    // Validar objetivos
    if (!this.generalObjectives || this.generalObjectives.length === 0) {
      throw new BadRequestException("Debe haber al menos un objetivo general");
    }

    if (!this.specificObjectives || this.specificObjectives.length < 2) {
      throw new BadRequestException(
        "Debe haber al menos dos objetivos específicos"
      );
    }

    // Validar metodología
    if (!this.methodology || !this.methodology.approach) {
      throw new BadRequestException("El enfoque metodológico es obligatorio");
    }

    // Validar método de evaluación
    if (!this.evaluationMethod || this.evaluationMethod.trim().length === 0) {
      throw new BadRequestException("El método de evaluación es obligatorio");
    }

    // Validar datos del paciente
    if (
      !this.patientName ||
      !this.patientDocumentNumber ||
      !this.patientDiagnosis
    ) {
      throw new BadRequestException(
        "Los datos del paciente son obligatorios para el plan de trabajo"
      );
    }

    return true;
  }

  getFormData(): Record<string, any> {
    return {
      type: this.type,
      title: this.title,
      startDate: this.startDate,
      endDate: this.endDate,
      duration: this.duration,
      modality: this.modality,
      generalObjectives: this.generalObjectives,
      specificObjectives: this.specificObjectives,
      methodology: this.methodology,
      schedule: this.schedule,
      evaluationMethod: this.evaluationMethod,
      evaluationFrequency: this.evaluationFrequency,
      progressIndicators: this.progressIndicators,
      humanResources: this.humanResources,
      materialResources: this.materialResources,
      estimatedBudget: this.estimatedBudget,
      observations: this.observations,
      recommendations: this.recommendationsText,
      patient: this.getPatientInfo(),
    };
  }

  setFormData(data: Record<string, any>): void {
    this.startDate = data.startDate ? new Date(data.startDate) : new Date();
    this.endDate = data.endDate ? new Date(data.endDate) : new Date();
    this.duration = data.duration || 0;
    this.modality = data.modality;
    this.generalObjectives = data.generalObjectives || [];
    this.specificObjectives = data.specificObjectives || [];
    this.methodology = data.methodology;
    this.schedule = data.schedule || [];
    this.evaluationMethod = data.evaluationMethod;
    this.evaluationFrequency = data.evaluationFrequency;
    this.progressIndicators = data.progressIndicators || [];
    this.humanResources = data.humanResources || [];
    this.materialResources = data.materialResources || [];
    this.estimatedBudget = data.estimatedBudget;
    this.observations = data.observations;
    this.recommendationsText = data.recommendations;

    // Actualizar título automáticamente
    this.title = this.generateTitle();
  }

  // Métodos específicos del Plan de Trabajo
  generateTitle(): string {
    const patientName = this.patientName || "Sin paciente";
    const year = this.startDate
      ? this.startDate.getFullYear()
      : new Date().getFullYear();
    return `Plan de Trabajo - ${patientName} - ${year}`;
  }

  addGeneralObjective(objective: {
    id: string;
    description: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    indicators: string;
    status: "PENDING" | "IN_PROGRESS" | "ACHIEVED";
  }): void {
    if (!this.generalObjectives) {
      this.generalObjectives = [];
    }
    this.generalObjectives.push(objective);
  }

  addSpecificObjective(objective: {
    id: string;
    description: string;
    generalObjectiveId: string;
    expectedOutcome: string;
    evaluationCriteria: string;
    deadline: Date;
    status: "PENDING" | "IN_PROGRESS" | "ACHIEVED";
  }): void {
    if (!this.specificObjectives) {
      this.specificObjectives = [];
    }
    this.specificObjectives.push(objective);
  }

  updateObjectiveStatus(
    objectiveId: string,
    status: "PENDING" | "IN_PROGRESS" | "ACHIEVED"
  ): void {
    // Buscar en objetivos generales
    const generalObj = this.generalObjectives?.find(
      (obj) => obj.id === objectiveId
    );
    if (generalObj) {
      generalObj.status = status;
      return;
    }

    // Buscar en objetivos específicos
    const specificObj = this.specificObjectives?.find(
      (obj) => obj.id === objectiveId
    );
    if (specificObj) {
      specificObj.status = status;
    }
  }

  getObjectivesByPriority(priority: "HIGH" | "MEDIUM" | "LOW") {
    return (
      this.generalObjectives?.filter((obj) => obj.priority === priority) || []
    );
  }

  getAchievedObjectivesCount(): {
    general: number;
    specific: number;
    totalGeneral: number;
    totalSpecific: number;
  } {
    const achievedGeneral =
      this.generalObjectives?.filter((obj) => obj.status === "ACHIEVED")
        .length || 0;
    const achievedSpecific =
      this.specificObjectives?.filter((obj) => obj.status === "ACHIEVED")
        .length || 0;

    return {
      general: achievedGeneral,
      specific: achievedSpecific,
      totalGeneral: this.generalObjectives?.length || 0,
      totalSpecific: this.specificObjectives?.length || 0,
    };
  }

  getProgressPercentage(): number {
    const achieved = this.getAchievedObjectivesCount();
    const total = achieved.totalGeneral + achieved.totalSpecific;
    const completed = achieved.general + achieved.specific;

    return total > 0 ? (completed / total) * 100 : 0;
  }

  calculateDuration(): number {
    if (!this.startDate || !this.endDate) return 0;

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.ceil(diffDays / 30); // Aproximar a meses
  }
}
