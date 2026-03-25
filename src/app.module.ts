import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./modules/auth/auth.module";
import { envs } from "./config/envs";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./modules/users/users.module";
import { PrinterModule } from "./modules/printer/printer.module";
import { FormsModule } from "./modules/forms/forms.module";
import { StorageModule } from "./modules/storage/storage.module";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./modules/auth";
import { dataSourceOptions } from "./config/typeorm.config";

@Module({
  imports: [
    // Configuración de TypeORM usando configuración centralizada
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      // Sobrescribir configuración específica de NestJS
      autoLoadEntities: true,
      // IMPORTANTE: synchronize siempre false - usar migraciones
      // synchronize: false,
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
