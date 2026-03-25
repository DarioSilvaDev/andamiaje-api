import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { emailConfig } from "@/config/email.config";
import { EmailService } from "./email.service";

/**
 * Módulo de Email
 *
 * Proporciona servicios de envío de email para notificaciones del sistema:
 * - Notificaciones de workflow (envío, aprobación, rechazo, edición)
 * - Notificaciones de cuenta (registro, cambio de contraseña)
 * - Notificaciones personalizadas
 *
 * Utiliza Handlebars para templates HTML responsive
 */
@Module({
  imports: [MailerModule.forRoot(emailConfig)],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
