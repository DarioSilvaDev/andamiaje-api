import { Entity, Column, Index } from "typeorm";
import { BaseForm } from "../base/base-form.entity";
import { FORMTYPE } from "@/commons/enums";
import { BadRequestException } from "@nestjs/common";

@Entity("family_followup_forms_v2")
@Index(["periodStart", "periodEnd"])
export class FamilyFollowUpFormV2 extends BaseForm {
  // Información familiar
  @Column({ type: "jsonb" })
  familyComposition: Array<{
    name: string;
    relationship: string;
    age: number;
    occupation: string;
    involvementLevel: "HIGH" | "MEDIUM" | "LOW";
  }>;

  // Periodo
  @Column({ type: "date" })
  periodStart: Date;

  @Column({ type: "date" })
  periodEnd: Date;

  // Contactos realizados
  @Column({ type: "jsonb" })
  familyContacts: Array<{
    date: Date;
    type: "PRESENCIAL" | "TELEFÓNICO" | "VIRTUAL";
    participants: string[];
    topics: string[];
    duration: number;
    agreements: string;
    observations: string;
  }>;

  // Dinámica familiar
  @Column({ type: "jsonb" })
  familyDynamics: {
    communication: {
      quality: "HIGH" | "MEDIUM" | "LOW";
      description: string;
    };
    supportNetwork: {
      strength: "HIGH" | "MEDIUM" | "LOW";
      description: string;
    };
    parentingStyle: string;
    conflictResolution: string;
    cohesion: {
      level: "HIGH" | "MEDIUM" | "LOW";
      description: string;
    };
  };

  // Necesidades identificadas
  @Column({ type: "jsonb", nullable: true })
  identifiedNeeds: Array<{
    category: string;
    description: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    proposedIntervention: string;
  }>;

  // Recursos familiares
  @Column({ type: "jsonb" })
  familyResources: {
    economic: "SUFFICIENT" | "LIMITED" | "INSUFFICIENT";
    emotional: "STRONG" | "MODERATE" | "WEAK";
    social: "EXTENSIVE" | "MODERATE" | "LIMITED";
    educational: "HIGH" | "MEDIUM" | "LOW";
  };

  // Participación en el proceso
  @Column({ type: "jsonb" })
  participation: {
    sessionsAttendance: number;
    homeActivitiesCompliance: "HIGH" | "MEDIUM" | "LOW";
    communicationFrequency: "HIGH" | "MEDIUM" | "LOW";
    observations: string;
  };

  // Evaluación del periodo
  @Column({ type: "jsonb" })
  periodEvaluation: {
    progressAchieved: string[];
    persistentChallenges: string[];
    familyStrengths: string[];
    areasForImprovement: string[];
  };

  // Recomendaciones
  @Column({ type: "text" })
  recommendationsText: string;

  @Column({ type: "jsonb", nullable: true })
  suggestedInterventions: string[];

  @Column({ type: "jsonb", nullable: true })
  referrals: string[];

  // Constructor
  constructor() {
    super();
    this.type = FORMTYPE.SEGUIMIENTO_FAMILIA;
  }

  // Implementación de métodos abstractos
  async validate(): Promise<boolean> {
    // Validar composición familiar
    if (!this.familyComposition || this.familyComposition.length === 0) {
      throw new BadRequestException("La composición familiar es obligatoria");
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

    // Validar contactos
    if (!this.familyContacts || this.familyContacts.length === 0) {
      throw new BadRequestException(
        "Debe registrarse al menos un contacto familiar"
      );
    }

    // Validar dinámica familiar
    if (!this.familyDynamics) {
      throw new BadRequestException(
        "La evaluación de la dinámica familiar es obligatoria"
      );
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
      familyComposition: this.familyComposition,
      periodStart: this.periodStart,
      periodEnd: this.periodEnd,
      familyContacts: this.familyContacts,
      familyDynamics: this.familyDynamics,
      identifiedNeeds: this.identifiedNeeds,
      familyResources: this.familyResources,
      participation: this.participation,
      periodEvaluation: this.periodEvaluation,
      recommendations: this.recommendationsText,
      suggestedInterventions: this.suggestedInterventions,
      referrals: this.referrals,
      patient: this.getPatientInfo(),
    };
  }

  setFormData(data: Record<string, any>): void {
    this.familyComposition = data.familyComposition || [];
    this.periodStart = data.periodStart
      ? new Date(data.periodStart)
      : new Date();
    this.periodEnd = data.periodEnd ? new Date(data.periodEnd) : new Date();
    this.familyContacts = data.familyContacts || [];
    this.familyDynamics = data.familyDynamics;
    this.identifiedNeeds = data.identifiedNeeds || [];
    this.familyResources = data.familyResources;
    this.participation = data.participation;
    this.periodEvaluation = data.periodEvaluation;
    this.recommendationsText = data.recommendations;
    this.suggestedInterventions = data.suggestedInterventions || [];
    this.referrals = data.referrals || [];

    // Actualizar título automáticamente
    this.title = this.generateTitle();
  }

  // Métodos específicos del Seguimiento Familiar
  generateTitle(): string {
    const patientName = this.patientName || "Sin paciente";
    const date = this.periodStart
      ? this.periodStart.toLocaleDateString("es-ES")
      : new Date().toLocaleDateString("es-ES");
    return `Seguimiento Familiar - ${patientName} - ${date}`;
  }

  getTotalContacts(): number {
    return this.familyContacts?.length || 0;
  }

  getContactsByType(type: "PRESENCIAL" | "TELEFÓNICO" | "VIRTUAL"): number {
    return (
      this.familyContacts?.filter((contact) => contact.type === type).length ||
      0
    );
  }

  getFamilySize(): number {
    return this.familyComposition?.length || 0;
  }

  getHighInvolvementMembers(): number {
    return (
      this.familyComposition?.filter(
        (member) => member.involvementLevel === "HIGH"
      ).length || 0
    );
  }

  getIdentifiedNeedsByPriority(priority: "HIGH" | "MEDIUM" | "LOW"): number {
    return (
      this.identifiedNeeds?.filter((need) => need.priority === priority)
        .length || 0
    );
  }

  hasPositiveResources(): boolean {
    if (!this.familyResources) return false;

    return (
      this.familyResources.economic !== "INSUFFICIENT" &&
      this.familyResources.emotional !== "WEAK" &&
      this.familyResources.social !== "LIMITED"
    );
  }

  // Método para generar resumen
  getSummary(): string {
    return `
      SEGUIMIENTO FAMILIAR
      
      PACIENTE: ${this.patientName}
      PERIODO: ${this.periodStart.toLocaleDateString("es-ES")} - ${this.periodEnd.toLocaleDateString("es-ES")}
      
      COMPOSICIÓN FAMILIAR: ${this.getFamilySize()} miembros
      Miembros con alta participación: ${this.getHighInvolvementMembers()}
      
      CONTACTOS REALIZADOS:
      Total: ${this.getTotalContacts()}
      Presenciales: ${this.getContactsByType("PRESENCIAL")}
      Telefónicos: ${this.getContactsByType("TELEFÓNICO")}
      Virtuales: ${this.getContactsByType("VIRTUAL")}
      
      DINÁMICA FAMILIAR:
      Comunicación: ${this.familyDynamics?.communication?.quality || "No evaluada"}
      Red de Apoyo: ${this.familyDynamics?.supportNetwork?.strength || "No evaluada"}
      Cohesión: ${this.familyDynamics?.cohesion?.level || "No evaluada"}
      
      RECURSOS FAMILIARES:
      Económicos: ${this.familyResources?.economic || "No evaluado"}
      Emocionales: ${this.familyResources?.emotional || "No evaluado"}
      Sociales: ${this.familyResources?.social || "No evaluado"}
      
      NECESIDADES IDENTIFICADAS:
      Alta prioridad: ${this.getIdentifiedNeedsByPriority("HIGH")}
      Media prioridad: ${this.getIdentifiedNeedsByPriority("MEDIUM")}
      Baja prioridad: ${this.getIdentifiedNeedsByPriority("LOW")}
      
      RECOMENDACIONES:
      ${this.recommendationsText}
    `.trim();
  }
}
