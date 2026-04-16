import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";

import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { ALLOW_PENDING_SIGNATURE_KEY } from "../decorators/allow-pending-signature.decorator";
import { AccountStatus } from "@/commons/enums";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      // if (info instanceof jwt.TokenExpiredError) {
      if (info?.name === "TokenExpiredError") {
        throw new UnauthorizedException("Token vencido, iniciar sesion.");
      }

      // if (info instanceof jwt.JsonWebTokenError) {
      if (info?.name === "JsonWebTokenError") {
        throw new UnauthorizedException("Token inválido o incorrecto");
      }

      throw new UnauthorizedException("Sin acceso autorizado");
    }

    const allowPendingSignature = this.reflector.getAllAndOverride<boolean>(
      ALLOW_PENDING_SIGNATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (
      user.accountStatus === AccountStatus.PENDING_SIGNATURE &&
      !allowPendingSignature
    ) {
      throw new ForbiddenException(
        "Debes cargar tu firma digital para acceder al sistema",
      );
    }

    return user;
  }
}
