import { UserRole } from "@/entities/user.entity";

export const ROLE_PERMISSIONS = {
  [UserRole.DIRECTOR]: {
    name: "Director",
    description: "Acceso completo al sistema",
    permissions: [
      "users:read",
      "users:write",
      "users:delete",
      "documents:read",
      "documents:write",
      "documents:delete",
      "documents:approve",
      "documents:reject",
      "files:read",
      "files:write",
      "files:delete",
      "reports:read",
      "reports:write",
    ],
  },
  [UserRole.TERAPEUTA]: {
    name: "Terapeuta",
    description: "Puede crear y gestionar documentos propios",
    permissions: [
      "users:read:own",
      "documents:read:own",
      "documents:write:own",
      "documents:delete:own",
      "files:read:own",
      // "files:write:own",
      // "files:delete:own",
    ],
  },
  [UserRole.ACOMPANIANTE_EXTERNO]: {
    name: "Acompañante Externo",
    description: "Puede crear y gestionar documentos propios",
    permissions: [
      "users:read:own",
      "documents:read:own",
      "documents:write:own",
      "documents:delete:own",
      "files:read:own",
      "files:write:own",
      "files:delete:own",
    ],
  },
  [UserRole.COORDINADOR]: {
    name: "Coordinador",
    description: "Puede crear y gestionar documentos propios",
    permissions: [
      "users:read:own",
      "documents:read:own",
      "documents:write:own",
      "documents:delete:own",
      "documents:read:acompaniante_externo",
      "documents:write:acompaniante_externo",
      "documents:delete:acompaniante_externo",
      "files:read:own",
      "files:write:own",
      "files:delete:own",
    ],
  },
};

export const PERMISSION_GROUPS = {
  USERS: "users",
  DOCUMENTS: "documents",
  FILES: "files",
  REPORTS: "reports",
};

export const PERMISSION_ACTIONS = {
  READ: "read",
  WRITE: "write",
  DELETE: "delete",
  APPROVE: "approve",
  REJECT: "reject",
};

export const ROLE_HIERARCHY = {
  [UserRole.DIRECTOR]: 4,
  [UserRole.COORDINADOR]: 3,
  [UserRole.TERAPEUTA]: 2,
  [UserRole.ACOMPANIANTE_EXTERNO]: 1,
};
