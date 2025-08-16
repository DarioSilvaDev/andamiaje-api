import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}

  // incluir el ID de usuario y el ID de correlación
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, userId, url, correlationId, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;
        this.logger.log(
          `${method} ${url} ${statusCode} ${Date.now() - now}ms`,
          {
            correlationId,
            userId,
            userAgent,
            ip,
          },
          'LoggingInterceptor',
        );
      }),
    );
  }
}
