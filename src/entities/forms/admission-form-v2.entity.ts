import { Entity, Column, Index } from "typeorm";
import { BaseForm } from "../base/base-form.entity";
import { FORMTYPE } from "@/commons/enums";
import { BadRequestException } from "@nestjs/common";

@Entity("admission_forms_v2")
@Index(["admissionDate", "createdAt"])
export class AdmissionFormV2 extends BaseForm {
  @Column({ type: "date" })
  admissionDate: Date;

  @Column({ type: "varchar", length: 200 })
  referralSource: string;

  @Column({ type: "text" })
  referralReason: string;

  // Datos extendidos del paciente (específicos de admisión)
  @Column({ type: "varchar", length: 200, nullable: true })
  patientAddress?: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  patientPhone?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  patientEmail?: string;

  // Datos familiares
  @Column({ type: "jsonb", nullable: true })
  familyData: {
    primaryCaregiver: {
      name: string;
      relationship: string;
      phone: string;
      email: string;
    };
    familyComposition: string[];
    familyDynamics: string;
    socioeconomicLevel: "HIGH" | "MEDIUM" | "LOW";
  };

  // Antecedentes médicos
  @Column({ type: "jsonb", nullable: true })
  medicalHistory: {
    prenatalHistory: string;
    perinatalHistory: string;
    postnatalHistory: string;
    developmentalMilestones: string;
    previousTreatments: string[];
    currentMedication: string[];
    allergies: string[];
  };

  // Evaluación inicial
  @Column({ type: "jsonb", nullable: true })
  initialEvaluation: {
    communicationSkills: {
      receptive: string;
      expressive: string;
      pragmatic: string;
      score: number;
    };
    cognitiveSkills: {
      attention: string;
      memory: string;
      reasoning: string;
      score: number;
    };
    socialSkills: {
      interaction: string;
      cooperation: string;
      empathy: string;
      score: number;
    };
    motorSkills: {
      gross: string;
      fine: string;
      score: number;
    };
  };

  // Instrumentos aplicados
  @Column({ type: "jsonb", nullable: true })
  assessmentTools: Array<{
    name: string;
    date: Date;
    results: string;
    conclusions: string;
  }>;

  // Diagnóstico
  @Column({ type: "jsonb", nullable: true })
  diagnosis: {
    primary: string;
    secondary: string[];
    severity: "MILD" | "MODERATE" | "SEVERE";
    prognosis: "FAVORABLE" | "RESERVED" | "UNFAVORABLE";
  };

  // Recomendaciones
  @Column({ type: "jsonb", nullable: true })
  recommendations: {
    interventionType: string;
    frequency: string;
    duration: string;
    additionalServices: string[];
    familyGuidance: string;
  };

  @Column({ type: "text" })
  conclusions: string;

  @Column({
    type: "enum",
    enum: ["HIGH", "MEDIUM", "LOW"],
    default: "MEDIUM",
  })
  urgencyLevel: string;

  // Constructor
  constructor() {
    super();
    this.type = FORMTYPE.INFORME_ADMISION;
  }

  // Implementación de métodos abstractos
  async validate(): Promise<boolean> {
    // Validaciones obligatorias
    if (!this.admissionDate) {
      throw new BadRequestException("La fecha de admisión es obligatoria");
    }

    if (!this.referralSource || this.referralSource.trim().length === 0) {
      throw new BadRequestException("La fuente de derivación es obligatoria");
    }

    if (!this.referralReason || this.referralReason.trim().length === 0) {
      throw new BadRequestException("El motivo de derivación es obligatorio");
    }

    // Validar datos completos del paciente
    if (!this.patientName || !this.patientDocumentNumber || !this.patientAge) {
      throw new BadRequestException(
        "Los datos básicos del paciente son obligatorios (nombre, documento, edad)"
      );
    }

    if (!this.patientDiagnosis || this.patientDiagnosis.trim().length === 0) {
      throw new BadRequestException(
        "El diagnóstico del paciente es obligatorio"
      );
    }

    // Validar diagnóstico
    if (!this.diagnosis || !this.diagnosis.primary) {
      throw new BadRequestException("El diagnóstico primario es obligatorio");
    }

    // Validar recomendaciones
    if (
      !this.recommendations ||
      !this.recommendations.interventionType ||
      !this.recommendations.frequency
    ) {
      throw new BadRequestException(
        "Las recomendaciones de intervención y frecuencia son obligatorias"
      );
    }

    // Validar conclusiones
    if (!this.conclusions || this.conclusions.trim().length === 0) {
      throw new BadRequestException("Las conclusiones son obligatorias");
    }

    // Validar instrumentos de evaluación
    if (!this.assessmentTools || this.assessmentTools.length === 0) {
      throw new BadRequestException(
        "Debe aplicarse al menos un instrumento de evaluación"
      );
    }

    return true;
  }

  getFormData(): Record<string, any> {
    return {
      type: this.type,
      title: this.title,
      admissionDate: this.admissionDate,
      referralSource: this.referralSource,
      referralReason: this.referralReason,
      patient: {
        ...this.getPatientInfo(),
        address: this.patientAddress,
        phone: this.patientPhone,
        email: this.patientEmail,
      },
      familyData: this.familyData,
      medicalHistory: this.medicalHistory,
      initialEvaluation: this.initialEvaluation,
      assessmentTools: this.assessmentTools,
      diagnosis: this.diagnosis,
      recommendations: this.recommendations,
      conclusions: this.conclusions,
      urgencyLevel: this.urgencyLevel,
    };
  }

  setFormData(data: Record<string, any>): void {
    this.admissionDate = data.admissionDate
      ? new Date(data.admissionDate)
      : new Date();
    this.referralSource = data.referralSource;
    this.referralReason = data.referralReason;
    this.patientAddress = data.patientAddress;
    this.patientPhone = data.patientPhone;
    this.patientEmail = data.patientEmail;
    this.familyData = data.familyData;
    this.medicalHistory = data.medicalHistory;
    this.initialEvaluation = data.initialEvaluation;
    this.assessmentTools = data.assessmentTools || [];
    this.diagnosis = data.diagnosis;
    this.recommendations = data.recommendations;
    this.conclusions = data.conclusions;
    this.urgencyLevel = data.urgencyLevel || "MEDIUM";

    // Actualizar título automáticamente
    this.title = this.generateTitle();
  }

  // Métodos específicos de Informe de Admisión
  generateTitle(): string {
    const date = this.admissionDate
      ? this.admissionDate.toLocaleDateString("es-ES")
      : new Date().toLocaleDateString("es-ES");
    const patientName = this.patientName || "Sin nombre";
    return `Informe de Admisión - ${patientName} - ${date}`;
  }

  addAssessmentTool(tool: {
    name: string;
    date: Date;
    results: string;
    conclusions: string;
  }): void {
    if (!this.assessmentTools) {
      this.assessmentTools = [];
    }
    this.assessmentTools.push(tool);
  }

  removeAssessmentTool(toolName: string): void {
    if (!this.assessmentTools) return;
    this.assessmentTools = this.assessmentTools.filter(
      (tool) => tool.name !== toolName
    );
  }

  getOverallScore(): number {
    if (!this.initialEvaluation) return 0;

    const scores = [
      this.initialEvaluation.communicationSkills?.score || 0,
      this.initialEvaluation.cognitiveSkills?.score || 0,
      this.initialEvaluation.socialSkills?.score || 0,
      this.initialEvaluation.motorSkills?.score || 0,
    ];

    const total = scores.reduce((acc, score) => acc + score, 0);
    return total / scores.length;
  }

  getSeverityLevel(): string {
    const severityMap = {
      MILD: "Leve",
      MODERATE: "Moderado",
      SEVERE: "Severo",
    };
    return this.diagnosis?.severity
      ? severityMap[this.diagnosis.severity]
      : "No especificado";
  }

  getPrognosisDescription(): string {
    const prognosisMap = {
      FAVORABLE: "Favorable",
      RESERVED: "Reservado",
      UNFAVORABLE: "Desfavorable",
    };
    return this.diagnosis?.prognosis
      ? prognosisMap[this.diagnosis.prognosis]
      : "No especificado";
  }

  hasAllergies(): boolean {
    return (
      this.medicalHistory?.allergies && this.medicalHistory.allergies.length > 0
    );
  }

  isOnMedication(): boolean {
    return (
      this.medicalHistory?.currentMedication &&
      this.medicalHistory.currentMedication.length > 0
    );
  }

  // Método para generar resumen del informe
  getSummary(): string {
    const overallScore = this.getOverallScore();
    const severity = this.getSeverityLevel();
    const prognosis = this.getPrognosisDescription();

    return `
      INFORME DE ADMISIÓN
      
      DATOS DEL PACIENTE:
      Nombre: ${this.patientName}
      Documento: ${this.patientDocumentNumber}
      Edad: ${this.patientAge} años
      Diagnóstico: ${this.patientDiagnosis}
      
      DERIVACIÓN:
      Fuente: ${this.referralSource}
      Motivo: ${this.referralReason}
      
      EVALUACIÓN INICIAL:
      Puntuación Global: ${overallScore.toFixed(1)}/10
      
      DIAGNÓSTICO:
      Principal: ${this.diagnosis?.primary || "No especificado"}
      Severidad: ${severity}
      Pronóstico: ${prognosis}
      
      RECOMENDACIONES:
      Tipo de Intervención: ${this.recommendations?.interventionType || "No especificado"}
      Frecuencia: ${this.recommendations?.frequency || "No especificado"}
      
      CONCLUSIONES:
      ${this.conclusions}
      
      NIVEL DE URGENCIA: ${this.urgencyLevel}
    `.trim();
  }
}
