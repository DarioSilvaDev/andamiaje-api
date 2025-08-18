import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./modules/auth/auth.module";
import { User } from "./entities/user.entity";
import { Document } from "./entities/document.entity";
import { DocumentFile } from "./entities/document-file.entity";
import { envs } from "./config/envs";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DocumentsModule } from "./modules/documents/documents.module";
import { UsersModule } from "./modules/users/users.module";
import { PrinterModule } from "./modules/printer/printer.module";

@Module({
  imports: [
    // Configuración de TypeORM
    TypeOrmModule.forRoot({
      type: "postgres",
      host: envs.DB_HOST || "localhost",
      port: parseInt(envs.DB_PORT) || 5432,
      username: envs.DB_USERNAME || "andamiaje",
      password: envs.DB_PASSWORD || "andamiaje",
      database: envs.DB_DATABASE || "andamiaje",
      synchronize: envs.NODE_ENV !== "production",
      logging: envs.DB_LOGGING,
      entities: [User, Document, DocumentFile],
      autoLoadEntities: true,
    }),

    // Módulos de la aplicación
    AuthModule,
    DocumentsModule,
    UsersModule,
    PrinterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
