import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./modules/auth/auth.module";
import { User } from "./entities/user.entity";
import { Document } from "./entities/document.entity";
import { DocumentFile } from "./entities/document-file.entity";
import { envs } from "./config/envs";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
    // Configuración de TypeORM
    TypeOrmModule.forRoot({
      type: "postgres",
      host: envs.DB_HOST || "localhost",
      port: parseInt(envs.DB_PORT) || 5432,
      username: envs.DB_USERNAME || "postgres",
      password: envs.DB_PASSWORD || "postgres",
      database: envs.DB_DATABASE || "andamiaje_db",
      synchronize: envs.NODE_ENV !== "production",
      logging: envs.DB_LOGGING,
      entities: [User, Document, DocumentFile],
      autoLoadEntities: true,
    }),

    // Módulos de la aplicación
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
