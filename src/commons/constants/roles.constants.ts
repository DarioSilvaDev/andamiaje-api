export enum UserRole {
  DIRECTOR = "director",
  TERAPEUTA = "terapeuta",
  ACOMPANIANTE_EXTERNO = "acompaniante_externo",
  COORDINADOR_ALUMNO = "coordinador_alumno",
  COORDINADOR_FAMILIA = "coordinador_familia",
}

// 📌 Grupos de documentos / acciones específicas
export const DOCUMENT_TYPES = {
  PLAN_TRABAJO: "plan_trabajo",
  INFORME_SEMESTRAL: "informe_semestral",
  ACTAS: "actas",
  REPORTE_MENSUAL: "reporte_mensual",
  SEGUIMIENTO_ACOMPANANTE: "seguimiento_acompaniante_externo",
  SEGUIMIENTO_FAMILIA: "seguimiento_familia",
  FACTURA: "factura",
};

export const PERMISSION_ACTIONS = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  APPROVE: "approve",
  REJECT: "reject",
  UPLOAD: "upload",
};

// 📌 Mapeo de permisos por rol
export const ROLE_PERMISSIONS = {
  [UserRole.DIRECTOR]: {
    name: "Director",
    description: "Acceso completo al sistema",
    permissions: [
      // Usuarios
      "users:read",
      "users:write",
      "users:delete",

      // Documentos (todos los tipos y acciones)
      ...Object.values(DOCUMENT_TYPES).flatMap((doc) => [
        `documents:${doc}:${PERMISSION_ACTIONS.CREATE}`,
        `documents:${doc}:${PERMISSION_ACTIONS.READ}`,
        `documents:${doc}:${PERMISSION_ACTIONS.UPDATE}`,
        `documents:${doc}:${PERMISSION_ACTIONS.DELETE}`,
        `documents:${doc}:${PERMISSION_ACTIONS.APPROVE}`,
        `documents:${doc}:${PERMISSION_ACTIONS.REJECT}`,
      ]),

      // Archivos
      "files:read",
      "files:write",
      "files:delete",
    ],
  },

  [UserRole.TERAPEUTA]: {
    name: "Terapeuta",
    description: "Gestiona documentos vinculados a pacientes",
    permissions: [
      `documents:${DOCUMENT_TYPES.PLAN_TRABAJO}:create`,
      `documents:${DOCUMENT_TYPES.PLAN_TRABAJO}:read:own`,
      `documents:${DOCUMENT_TYPES.INFORME_SEMESTRAL}:create`,
      `documents:${DOCUMENT_TYPES.INFORME_SEMESTRAL}:read:own`,
      `documents:${DOCUMENT_TYPES.ACTAS}:create`,
      `documents:${DOCUMENT_TYPES.ACTAS}:read:own`,
      `documents:${DOCUMENT_TYPES.FACTURA}:upload`,

      "files:read:own",
      "files:write:own",
    ],
  },

  [UserRole.COORDINADOR_ALUMNO]: {
    name: "Coordinador (Alumno)",
    description: "Gestiona documentos de alumnos y acomp. externos",
    permissions: [
      `documents:${DOCUMENT_TYPES.PLAN_TRABAJO}:create`,
      `documents:${DOCUMENT_TYPES.PLAN_TRABAJO}:read:own`,
      `documents:${DOCUMENT_TYPES.SEGUIMIENTO_ACOMPANANTE}:create`,
      `documents:${DOCUMENT_TYPES.SEGUIMIENTO_ACOMPANANTE}:read:own`,
      `documents:${DOCUMENT_TYPES.REPORTE_MENSUAL}:create`,
      `documents:${DOCUMENT_TYPES.REPORTE_MENSUAL}:read:own`,
      `documents:${DOCUMENT_TYPES.ACTAS}:create`,
      `documents:${DOCUMENT_TYPES.ACTAS}:read:own`,
      `documents:${DOCUMENT_TYPES.FACTURA}:upload`,

      // Puede ver lo que suben los acompañantes externos
      `documents:${DOCUMENT_TYPES.REPORTE_MENSUAL}:read:acompaniante_externo`,
      `documents:${DOCUMENT_TYPES.PLAN_TRABAJO}:read:acompaniante_externo`,

      "files:read:own",
      "files:write:own",
    ],
  },

  [UserRole.COORDINADOR_FAMILIA]: {
    name: "Coordinador (Familia)",
    description: "Gestiona documentos vinculados a familias",
    permissions: [
      `documents:${DOCUMENT_TYPES.SEGUIMIENTO_FAMILIA}:create`,
      `documents:${DOCUMENT_TYPES.SEGUIMIENTO_FAMILIA}:read:own`,
      `documents:${DOCUMENT_TYPES.ACTAS}:create`,
      `documents:${DOCUMENT_TYPES.ACTAS}:read:own`,
      `documents:${DOCUMENT_TYPES.FACTURA}:upload`,

      "files:read:own",
      "files:write:own",
    ],
  },

  [UserRole.ACOMPANIANTE_EXTERNO]: {
    name: "Acompañante Externo",
    description: "Carga documentos propios de seguimiento de alumnos",
    permissions: [
      `documents:${DOCUMENT_TYPES.PLAN_TRABAJO}:create`,
      `documents:${DOCUMENT_TYPES.PLAN_TRABAJO}:read:own`,
      `documents:${DOCUMENT_TYPES.REPORTE_MENSUAL}:create`,
      `documents:${DOCUMENT_TYPES.REPORTE_MENSUAL}:read:own`,
      `documents:${DOCUMENT_TYPES.FACTURA}:upload`,

      "files:read:own",
      "files:write:own",
    ],
  },
};

// 📌 Jerarquía
export const ROLE_HIERARCHY = {
  [UserRole.DIRECTOR]: 5,
  [UserRole.COORDINADOR_ALUMNO]: 4,
  [UserRole.COORDINADOR_FAMILIA]: 4,
  [UserRole.TERAPEUTA]: 3,
  [UserRole.ACOMPANIANTE_EXTERNO]: 2,
};
