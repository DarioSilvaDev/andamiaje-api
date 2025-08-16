// src/common/filters/all-exceptions.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: Logger
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(request),
      message: `${exception instanceof Error ? exception.message : "Unknown error"}`,
    };

    this.logger.error(
      `Exception: ${exception instanceof HttpException ? exception.message : "Unknown error"}`,
      {
        statusCode: httpStatus,
        exception: {
          name:
            exception instanceof Error ? exception.name : "UnknownException",
          message:
            exception instanceof Error ? exception.message : "Unknown error",
          stack:
            exception instanceof Error ? exception.stack : "No stack trace",
        },
        userId: request.user?.id || "N/A",
        userRole: request.user?.role || "N/A",
        method: request.method,
        url: request.url,
        headers: {
          authorization: request.headers["authorization"] || "N/A", // Saber si el token estaba presente
          userAgent: request.headers["user-agent"] || "N/A",
        },
        body: request.body || {},
        timestamp: new Date().toISOString(),
        hostname: request.hostname || "N/A",
      },
      "ExceptionsFilter"
    );

    httpAdapter.reply(response, responseBody, httpStatus);
  }
}
