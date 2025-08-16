import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Response, NextFunction } from "express";
import { RequestWithUser } from "@/commons/types/express.types";

@Injectable()
export class AuthLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthLoggingMiddleware.name);

  use(req: RequestWithUser, res: Response, next: NextFunction) {
    const { method, url, ip, user } = req;
    const userAgent = req.get("User-Agent") || "Unknown";
    const timestamp = new Date().toISOString();

    // Log de acceso
    this.logger.log(
      `[${timestamp}] ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`
    );

    if (user) {
      this.logger.log(
        `Usuario autenticado: ${user.username} (${user.role}) - ID: ${user.id}`
      );
    } else {
      this.logger.log("Usuario no autenticado");
    }

    // Interceptar respuesta para logging
    const originalSend = res.send;
    res.send = function (body) {
      const responseTime = Date.now() - (req.startTime || Date.now());
      const statusCode = res.statusCode;

      if (user) {
        this.logger.log(
          `Respuesta para ${user.username}: ${statusCode} - Tiempo: ${responseTime}ms`
        );
      }

      return originalSend.call(this, body);
    }.bind(this);

    // Agregar timestamp de inicio
    req.startTime = Date.now();

    next();
  }
}
