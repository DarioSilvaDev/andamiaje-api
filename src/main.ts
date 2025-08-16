import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { BadRequestException, Logger, ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { envs } from "./config/envs";
import { LoggingInterceptor } from "./commons/interceptors/logging.interceptors";
import { AllExceptionsFilter } from "./commons/filters/all-exceptions.filter";

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
        const messages = errors
          .map((err) => {
            if (err.constraints) {
              return Object.values(err.constraints);
            }
            return [];
          })
          .flat();
        return new BadRequestException(...messages);
      },
    })
  );

  app.enableCors({
    origin: true,
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle("Andamiaje API")
    .setDescription(
      "API para gestión de usuarios y archivos con sistema de roles"
    )
    .setVersion(envs.NPM_PACKAGE_VERSION)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = envs.PORT;
  await app.listen(port);

  console.log(
    `🚀 Aplicación ejecutándose en: http://localhost:${port}/${envs.API_PREFIX}`
  );
  console.log(
    `📚 Documentación disponible en: http://localhost:${port}/api/docs`
  );
}

bootstrap().catch((error) => {
  console.error("Error al iniciar la aplicación:", error);
  process.exit(1);
});
