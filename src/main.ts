import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { BadRequestException, Logger, ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { envs } from "./config/envs";
import { LoggingInterceptor } from "./commons/interceptors/logging.interceptors";
import { AllExceptionsFilter } from "./commons/filters/all-exceptions.filter";
import { corsConfig } from "./config/cors.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = new Logger("Main");
  const httpAdapter = app.get(HttpAdapterHost);

  app.setGlobalPrefix(envs.API_PREFIX);

  app.useGlobalInterceptors(new LoggingInterceptor(logger));

  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter, new Logger()));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const formatErrors = (validationErrors) => {
          return validationErrors.map((err) => ({
            field: err.property,
            errors: Object.values(err.constraints || {}),
            children: err.children ? formatErrors(err.children) : [],
          }));
        };

        return new BadRequestException({
          message: "La validación del formulario ha fallado",
          errors: formatErrors(errors),
        });
      },
    }),
  );

  app.enableCors(corsConfig);

  app.use(cookieParser());
  const config = new DocumentBuilder()
    .setTitle("Andamiaje API")
    .setDescription(
      "API para gestión de usuarios y archivos con sistema de roles",
    )
    .setVersion(envs.NPM_PACKAGE_VERSION)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = envs.PORT;
  await app.listen(port);

  logger.log(
    `🚀 Aplicación ejecutándose en: http://localhost:${port}/${envs.API_PREFIX}`,
  );
  logger.log(
    `📚 Documentación disponible en: http://localhost:${port}/api/docs`,
  );
}

bootstrap().catch((error) => {
  const logger = new Logger("Bootstrap");
  logger.error("Error al iniciar la aplicación", error);
  process.exit(1);
});
