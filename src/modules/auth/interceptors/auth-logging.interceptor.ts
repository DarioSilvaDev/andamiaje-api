import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuthLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuthLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;
    const startTime = Date.now();

    // Log de inicio de operación
    if (user) {
      this.logger.log(
        `Usuario ${user.username} (${user.role}) accediendo a ${method} ${url}`,
      );
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          if (user) {
            this.logger.log(
              `Usuario ${user.username} completó ${method} ${url} en ${duration}ms`,
            );
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          if (user) {
            this.logger.error(
              `Usuario ${user.username} falló en ${method} ${url} en ${duration}ms: ${error.message}`,
            );
          }
        },
      }),
    );
  }
} 