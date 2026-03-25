import { Injectable, Logger } from "@nestjs/common";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  blockDuration?: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  blockedUntil?: number;
}

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);
  private readonly storage = new Map<string, RateLimitData>();

  async checkLimit(
    key: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const record = this.storage.get(key);

    // Si no hay registro o la ventana expiró, crear uno nuevo
    if (!record || now > record.resetTime) {
      const newRecord: RateLimitData = {
        count: 1,
        resetTime: now + config.windowMs,
        blockedUntil: undefined,
      };

      this.storage.set(key, newRecord);

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: newRecord.resetTime,
      };
    }

    // Verificar si está bloqueado
    if (record.blockedUntil && now < record.blockedUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
        blockedUntil: record.blockedUntil,
      };
    }

    // Incrementar contador
    record.count++;

    // Verificar si excede el límite
    if (record.count > config.maxRequests) {
      const blockDuration = config.blockDuration || config.windowMs;
      record.blockedUntil = now + blockDuration;

      this.logger.warn(
        `Rate limit exceeded for key: ${key}. Blocked until: ${new Date(record.blockedUntil).toISOString()}`
      );

      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
        blockedUntil: record.blockedUntil,
      };
    }

    return {
      allowed: true,
      remaining: config.maxRequests - record.count,
      resetTime: record.resetTime,
    };
  }

  async resetLimit(key: string): Promise<void> {
    this.storage.delete(key);
    this.logger.debug(`Rate limit reset for key: ${key}`);
  }

  async getStats(key?: string): Promise<RateLimitStats> {
    if (key) {
      const record = this.storage.get(key);
      return record ? { [key]: record } : {};
    }

    return Object.fromEntries(this.storage.entries());
  }

  // Limpiar registros expirados
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, record] of this.storage.entries()) {
      if (
        now > record.resetTime &&
        (!record.blockedUntil || now > record.blockedUntil)
      ) {
        this.storage.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Cleaned up ${cleaned} expired rate limit records`);
    }
  }

  // Iniciar limpieza automática cada 5 minutos
  startCleanup(): void {
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }
}

interface RateLimitData {
  count: number;
  resetTime: number;
  blockedUntil?: number;
}

interface RateLimitStats {
  [key: string]: RateLimitData;
}

// Configuraciones predefinidas
export const RATE_LIMIT_CONFIGS = {
  // Para endpoints de autenticación
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5, // 5 intentos por 15 minutos
    blockDuration: 30 * 60 * 1000, // Bloquear por 30 minutos
  },

  // Para endpoints críticos
  STRICT: {
    windowMs: 5 * 60 * 1000, // 5 minutos
    maxRequests: 3, // 3 intentos por 5 minutos
    blockDuration: 15 * 60 * 1000, // Bloquear por 15 minutos
  },

  // Para endpoints generales
  GENERAL: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 100, // 100 requests por minuto
  },

  // Para endpoints de API
  API: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 60, // 60 requests por minuto
  },
} as const;
