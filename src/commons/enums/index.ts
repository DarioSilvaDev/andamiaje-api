export enum AccountStatus {
  PENDING_SIGNATURE = "PENDING_SIGNATURE",
  ACTIVE = "ACTIVE",
  DISABLED = "DISABLED",
}

export enum UserRole {
  DIRECTOR = "director",
  TERAPEUTA = "terapeuta",
  ACOMPANIANTE_EXTERNO = "acompaniante_externo",
  COORDINADOR_UNO = "coordinador_uno",
  COORDINADOR_DOS = "coordinador_dos",
}

export enum MODALITY_ENUM {
  VIRTUAL = "VIRTUAL",
  PRESENCIAL = "PRESENCIAL",
}

export enum FORMTYPE {
  PLAN_TRABAJO = "PLAN_TRABAJO",
  INFORME_SEMESTRAL = "INFORME_SEMESTRAL",
  INFORME_ADMISION = "INFORME_ADMISION",
  ACTAS = "ACTAS",
  REPORTE_MENSUAL = "REPORTE_MENSUAL",
  SEGUIMIENTO_ACOMPANANTE = "SEGUIMIENTO_ACOMPANIANTE_EXTERNO",
  SEGUIMIENTO_FAMILIA = "SEGUIMIENTO_FAMILIA",
  FACTURA = "FACTURA",
}

export enum DocumentStatus {
  DRAFT = "draft",
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum DocumentScope {
  PACIENTE = "paciente",
  ALUMNO = "alumno",
  FAMILIA = "familia",
}

export enum DocumentType {
  PLAN_TRABAJO = "plan_trabajo",
  INFORME_SEMESTRAL = "informe_semestral",
  ACTAS = "actas",
  REPORTE_MENSUAL = "reporte_mensual",
  SEGUIMIENTO_ACOMPANANTE = "seguimiento_acompaniante_externo",
  SEGUIMIENTO_FAMILIA = "seguimiento_familia",
  FACTURA = "factura",
}
