import { Injectable, ForbiddenException } from "@nestjs/common";
import {
  ROLE_PERMISSIONS,
  ROLE_HIERARCHY,
  DOCUMENT_TYPES,
  PERMISSION_ACTIONS,
} from "@/commons/constants";
import { UserRole } from "@/commons/enums";

@Injectable()
export class AuthorizationService {
  /**
   * Verifica si un usuario tiene un permiso específico
   */
  hasPermission(userRole: UserRole, permission: string): boolean {
    const rolePermissions = ROLE_PERMISSIONS[userRole];
    if (!rolePermissions) {
      return false;
    }
    return rolePermissions.permissions.includes(permission);
  }

  /**
   * Verifica si un usuario tiene al menos uno de los permisos especificados
   */
  hasAnyPermission(userRole: UserRole, permissions: string[]): boolean {
    return permissions.some((permission) =>
      this.hasPermission(userRole, permission)
    );
  }

  /**
   * Verifica si un usuario tiene todos los permisos especificados
   */
  hasAllPermissions(userRole: UserRole, permissions: string[]): boolean {
    return permissions.every((permission) =>
      this.hasPermission(userRole, permission)
    );
  }

  /**
   * Verifica si un usuario tiene un rol superior o igual
   */
  hasRoleOrHigher(userRole: UserRole, requiredRole: UserRole): boolean {
    const userLevel = ROLE_HIERARCHY[userRole] || 0;
    const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
    return userLevel >= requiredLevel;
  }

  /**
   * Verifica si un usuario puede gestionar usuarios
   */
  canManageUsers(userRole: UserRole): boolean {
    return this.hasPermission(userRole, "users:write");
  }

  /**
   * Verifica si un usuario puede eliminar usuarios
   */
  canDeleteUsers(userRole: UserRole): boolean {
    return this.hasPermission(userRole, "users:delete");
  }

  /**
   * Verifica si un usuario puede aprobar documentos
   */
  canApproveDocuments(userRole: UserRole): boolean {
    return this.hasPermission(
      userRole,
      `documents:any:${PERMISSION_ACTIONS.APPROVE}`
    );
  }

  /**
   * Verifica si un usuario puede rechazar documentos
   */
  canRejectDocuments(userRole: UserRole): boolean {
    return this.hasPermission(
      userRole,
      `documents:any:${PERMISSION_ACTIONS.REJECT}`
    );
  }

  /**
   * Verifica si un usuario puede CREAR un documento de cierto tipo
   */
  canCreateDocument(userRole: UserRole, documentType: string): boolean {
    return this.hasPermission(
      userRole,
      `documents:${documentType}:${PERMISSION_ACTIONS.CREATE}`
    );
  }

  /**
   * Verifica si un usuario puede LEER un documento
   * - Si es propio → busca `:read:own`
   * - Si es de otro rol permitido → busca `:read:rol`
   * - Si es global → busca `:read`
   */
  canReadDocument(
    userRole: UserRole,
    documentType: string,
    ownership: "own" | "acompaniante_externo" | "global" = "own"
  ): boolean {
    let permission = `documents:${documentType}:${PERMISSION_ACTIONS.READ}`;
    if (ownership !== "global") {
      permission = `${permission}:${ownership}`;
    }
    return this.hasPermission(userRole, permission);
  }

  /**
   * Verifica si un usuario puede ACTUALIZAR un documento de cierto tipo
   */
  canUpdateDocument(userRole: UserRole, documentType: string): boolean {
    return this.hasPermission(
      userRole,
      `documents:${documentType}:${PERMISSION_ACTIONS.UPDATE}`
    );
  }

  /**
   * Verifica si un usuario puede ELIMINAR un documento de cierto tipo
   */
  canDeleteDocument(userRole: UserRole, documentType: string): boolean {
    return this.hasPermission(
      userRole,
      `documents:${documentType}:${PERMISSION_ACTIONS.DELETE}`
    );
  }

  /**
   * Verifica si un usuario puede subir facturas
   */
  canUploadFactura(userRole: UserRole): boolean {
    return this.hasPermission(
      userRole,
      `documents:${DOCUMENT_TYPES.FACTURA}:${PERMISSION_ACTIONS.UPLOAD}`
    );
  }

  /**
   * Obtiene todos los permisos de un rol
   */
  getRolePermissions(userRole: UserRole): string[] {
    const rolePermissions = ROLE_PERMISSIONS[userRole];
    return rolePermissions ? rolePermissions.permissions : [];
  }

  /**
   * Obtiene información del rol
   */
  getRoleInfo(userRole: UserRole) {
    const roleInfo = ROLE_PERMISSIONS[userRole];
    if (!roleInfo) {
      throw new ForbiddenException(`Rol ${userRole} no válido`);
    }
    return roleInfo;
  }

  /**
   * Verifica si un usuario puede acceder a un SCOPE específico (paciente, alumno, familia)
   */
  canAccessScope(userRole: UserRole, scope: string): boolean {
    const allowedScopes: Record<UserRole, string[]> = {
      [UserRole.DIRECTOR]: ["paciente", "alumno", "familia"],
      [UserRole.TERAPEUTA]: ["paciente"],
      [UserRole.COORDINADOR_UNO]: ["alumno"],
      [UserRole.COORDINADOR_DOS]: ["familia"],
      [UserRole.ACOMPANIANTE_EXTERNO]: ["alumno"],
    };
    return allowedScopes[userRole]?.includes(scope) ?? false;
  }
}
