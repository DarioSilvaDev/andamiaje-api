import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  SetMetadata,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

interface RateLimitOptions {
  windowMs: number; // Ventana de tiempo en milisegundos
  maxRequests: number; // Máximo número de requests por ventana
  message?: string; // Mensaje personalizado de error
  keyGenerator?: (context: ExecutionContext) => string; // Función para generar clave única
  skipSuccessfulRequests?: boolean; // Si contar solo requests fallidos
}

// Decorador para configurar rate limiting
export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata("rateLimit", options);

// Almacenamiento en memoria (en producción usar Redis)
interface RateLimitRecord {
  count: number;
  resetTime: number;
  blockedUntil?: number; // Para bloqueos temporales
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly storage = new Map<string, RateLimitRecord>();

  constructor(private reflector: Reflector) {
    // Limpiar registros expirados cada minuto
    setInterval(() => this.cleanup(), 60000);
  }

  canActivate(context: ExecutionContext): boolean {
    const rateLimitOptions = this.reflector.get<RateLimitOptions>(
      "rateLimit",
      context.getHandler()
    );

    if (!rateLimitOptions) {
      return true; // Sin rate limiting configurado
    }

    const key = this.generateKey(context, rateLimitOptions);
    const now = Date.now();
    const record = this.storage.get(key);

    // Verificar si está bloqueado temporalmente
    if (record?.blockedUntil && now < record.blockedUntil) {
      const remainingTime = Math.ceil((record.blockedUntil - now) / 1000);
      throw new HttpException(
        rateLimitOptions.message ||
          `Demasiados intentos. Intenta de nuevo en ${remainingTime} segundos.`,
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    // Inicializar o resetear registro si la ventana expiró
    if (!record || now > record.resetTime) {
      this.storage.set(key, {
        count: 1,
        resetTime: now + rateLimitOptions.windowMs,
      });
      return true;
    }

    // Incrementar contador
    record.count++;

    // Verificar si excede el límite
    if (record.count > rateLimitOptions.maxRequests) {
      // Bloquear por el tiempo de la ventana
      record.blockedUntil = record.resetTime;

      throw new HttpException(
        rateLimitOptions.message ||
          `Demasiados intentos (${rateLimitOptions.maxRequests} por ${
            rateLimitOptions.windowMs / 1000
          }s). Intenta de nuevo en ${Math.ceil(
            (record.resetTime - now) / 1000
          )} segundos.`,
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    return true;
  }

  private generateKey(
    context: ExecutionContext,
    options: RateLimitOptions
  ): string {
    if (options.keyGenerator) {
      return options.keyGenerator(context);
    }

    // Generar clave por defecto basada en IP + endpoint
    const request = context.switchToHttp().getRequest();
    const ip = this.getClientIp(request);
    const endpoint = `${request.method}:${request.route?.path || request.url}`;

    return `${ip}:${endpoint}`;
  }

  private getClientIp(request: any): string {
    return (
      request.headers["x-forwarded-for"]?.split(",")[0] ||
      request.headers["x-real-ip"] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      request.ip ||
      "unknown"
    );
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.storage.entries()) {
      if (
        now > record.resetTime &&
        (!record.blockedUntil || now > record.blockedUntil)
      ) {
        this.storage.delete(key);
      }
    }
  }

  // Método para obtener estadísticas (útil para debugging)
  getStats(): Record<string, RateLimitRecord> {
    return Object.fromEntries(this.storage.entries());
  }

  // Método para limpiar registros específicos (útil para testing)
  clearKey(key: string): void {
    this.storage.delete(key);
  }
}

// Decoradores predefinidos para casos comunes
export const AuthRateLimit = () =>
  RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5, // 5 intentos por 15 minutos
    message: "Demasiados intentos de login. Intenta de nuevo en 15 minutos.",
    keyGenerator: (context) => {
      const request = context.switchToHttp().getRequest();
      const ip = request.ip || request.connection.remoteAddress;
      return `auth:${ip}`;
    },
  });

export const StrictRateLimit = () =>
  RateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutos
    maxRequests: 3, // 3 intentos por 5 minutos
    message: "Demasiados intentos. Bloqueado por 5 minutos.",
    keyGenerator: (context) => {
      const request = context.switchToHttp().getRequest();
      const ip = request.ip || request.connection.remoteAddress;
      return `strict:${ip}`;
    },
  });

export const GeneralRateLimit = () =>
  RateLimit({
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 100, // 100 requests por minuto
    message: "Demasiados requests. Intenta de nuevo en 1 minuto.",
  });
