import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./modules/auth/auth.module";
import { envs } from "./config/envs";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./modules/users/users.module";
import { PrinterModule } from "./modules/printer/printer.module";
import { FormsModule } from "./modules/forms/forms.module";
import {
  ActaForm,
  AdmissionForm,
  Document,
  FormEntity,
  PlanForm,
  SemestralReportForm,
  User,
} from "./entities";
import { StorageModule } from "./modules/storage/storage.module";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./modules/auth";

@Module({
  imports: [
    // Configuración de TypeORM
    TypeOrmModule.forRoot({
      type: "postgres",
      url: envs.DATABASE_URL,
      // host: envs.DB_HOST || "localhost",
      // port: parseInt(envs.DB_PORT) || 5432,
      // username: envs.DB_USERNAME || "andamiaje",
      // password: envs.DB_PASSWORD || "andamiaje",
      // database: envs.DB_DATABASE || "andamiaje",
      synchronize: envs.NODE_ENV !== "production",
      ssl: {
        rejectUnauthorized: false, // necesaruio para neon
      },
      logging: envs.NODE_ENV !== "production",
      entities: [
        ActaForm,
        AdmissionForm,
        Document,
        FormEntity,
        PlanForm,
        SemestralReportForm,
        User,
      ],
      autoLoadEntities: true,
    }),

    // Módulos de la aplicación
    AuthModule,
    UsersModule,
    PrinterModule,
    FormsModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
