import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "@/commons/enums";

export interface OwnerCheck {
  entityName: string;
  idField: string;
  ownerField: string;
}

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const ownerCheck = this.reflector.get<OwnerCheck>(
      "ownerCheck",
      context.getHandler()
    );

    if (!ownerCheck) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceId =
      request.params[ownerCheck.idField] || request.body[ownerCheck.idField];

    if (!user || !resourceId) {
      throw new ForbiddenException("Acceso denegado");
    }

    // Los directores pueden acceder a todo
    if (user.role === UserRole.DIRECTOR) {
      return true;
    }

    // Para otros roles, verificar propiedad
    // Nota: Esta verificación se debe implementar en el servicio correspondiente
    // ya que necesitamos acceder a la base de datos
    return true;
  }
}
