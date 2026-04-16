import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "@/commons/enums";
import { DataSource, EntityTarget } from "typeorm";
import { OWNER_CHECK_KEY } from "../decorators/owner-check.decorator";

export interface OwnerCheck {
  entity: EntityTarget<any>;
  idField: string;
  ownerField: string;
  lookupField?: string;
  relations?: string[];
}

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ownerCheck = this.reflector.getAllAndOverride<OwnerCheck>(
      OWNER_CHECK_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!ownerCheck) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceId =
      request.params?.[ownerCheck.idField] ??
      request.body?.[ownerCheck.idField] ??
      request.query?.[ownerCheck.idField];

    if (!user || !resourceId) {
      throw new ForbiddenException("Acceso denegado");
    }

    // Los directores pueden acceder a todo
    if (user.role === UserRole.DIRECTOR) {
      return true;
    }

    const repository = this.dataSource.getRepository(ownerCheck.entity);
    const lookupField = ownerCheck.lookupField || "id";
    const normalizedResourceId = this.normalizeResourceId(resourceId);

    const resource = await repository.findOne({
      where: { [lookupField]: normalizedResourceId },
      relations: ownerCheck.relations || [],
    });

    if (!resource) {
      throw new NotFoundException("Recurso no encontrado");
    }

    const ownerId = this.getNestedValue(resource, ownerCheck.ownerField);

    if (!ownerId || Number(ownerId) !== Number(user.id)) {
      throw new ForbiddenException("No tienes permisos sobre este recurso");
    }

    return true;
  }

  private normalizeResourceId(value: string | number): string | number {
    if (typeof value === "number") {
      return value;
    }

    const trimmedValue = value.trim();
    const parsed = Number(trimmedValue);

    if (!Number.isNaN(parsed) && trimmedValue !== "") {
      return parsed;
    }

    return trimmedValue;
  }

  private getNestedValue(resource: Record<string, any>, path: string): any {
    return path.split(".").reduce((acc, key) => acc?.[key], resource);
  }
}
