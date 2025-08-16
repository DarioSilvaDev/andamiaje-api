import { Injectable, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@/entities/user.entity';
import { ROLE_PERMISSIONS, ROLE_HIERARCHY } from '@/commons/constants/roles.constants';

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
    return permissions.some(permission => this.hasPermission(userRole, permission));
  }

  /**
   * Verifica si un usuario tiene todos los permisos especificados
   */
  hasAllPermissions(userRole: UserRole, permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(userRole, permission));
  }

  /**
   * Verifica si un usuario puede acceder a un recurso basado en su rol
   */
  canAccessResource(userRole: UserRole, resourceType: string, action: string): boolean {
    const permission = `${resourceType}:${action}`;
    return this.hasPermission(userRole, permission);
  }

  /**
   * Verifica si un usuario puede acceder a un recurso específico (propio)
   */
  canAccessOwnResource(userRole: UserRole, resourceType: string, action: string): boolean {
    const permission = `${resourceType}:${action}:own`;
    return this.hasPermission(userRole, permission);
  }

  /**
   * Verifica si un usuario puede aprobar documentos
   */
  canApproveDocuments(userRole: UserRole): boolean {
    return this.hasPermission(userRole, 'documents:approve');
  }

  /**
   * Verifica si un usuario puede rechazar documentos
   */
  canRejectDocuments(userRole: UserRole): boolean {
    return this.hasPermission(userRole, 'documents:reject');
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
   * Verifica si un usuario puede gestionar otros usuarios
   */
  canManageUsers(userRole: UserRole): boolean {
    return this.hasPermission(userRole, 'users:write');
  }

  /**
   * Verifica si un usuario puede eliminar otros usuarios
   */
  canDeleteUsers(userRole: UserRole): boolean {
    return this.hasPermission(userRole, 'users:delete');
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
} 