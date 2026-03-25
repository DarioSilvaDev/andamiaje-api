import { Injectable, Logger } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { envs } from "@/config/envs";
import { User, BaseForm } from "@/entities";
import { FORMTYPE, NotificationType } from "@/commons/enums";

/**
 * Datos para el email de formulario enviado para revisión
 */
export interface FormSubmittedEmailData {
  recipientName: string;
  senderName: string;
  formType: string;
  formTitle: string;
  formId: string;
  submittedAt: Date;
  formUrl: string;
}

/**
 * Datos para el email de formulario aprobado
 */
export interface FormApprovedEmailData {
  recipientName: string;
  approverName: string;
  formType: string;
  formTitle: string;
  formId: string;
  approvedAt: Date;
  formUrl: string;
  pdfUrl?: string;
}

/**
 * Datos para el email de formulario rechazado
 */
export interface FormRejectedEmailData {
  recipientName: string;
  rejectorName: string;
  formType: string;
  formTitle: string;
  formId: string;
  rejectedAt: Date;
  rejectionReason: string;
  formUrl: string;
}

/**
 * Datos para el email de formulario editado
 */
export interface FormEditedEmailData {
  recipientName: string;
  editorName: string;
  formType: string;
  formTitle: string;
  formId: string;
  editedAt: Date;
  formUrl: string;
  changes?: string;
}

/**
 * Datos para email de bienvenida
 */
export interface WelcomeEmailData {
  recipientName: string;
  username: string;
  role: string;
  loginUrl: string;
}

/**
 * Datos para email de cambio de contraseña
 */
export interface PasswordChangedEmailData {
  recipientName: string;
  changedAt: Date;
  supportUrl: string;
}

/**
 * Servicio de Email
 *
 * Maneja el envío de emails con templates HTML profesionales
 * Integrado con el sistema de notificaciones del workflow
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailerService: MailerService) {}

  /**
   * Enviar email cuando un formulario es enviado para revisión
   */
  async sendFormSubmittedEmail(
    recipient: User,
    form: BaseForm,
    sender: User
  ): Promise<void> {
    if (!envs.MAIL_ENABLED) {
      this.logger.debug("Email deshabilitado por configuración");
      return;
    }

    try {
      const data: FormSubmittedEmailData = {
        recipientName: this.getUserDisplayName(recipient),
        senderName: this.getUserDisplayName(sender),
        formType: this.getFormTypeLabel(form.type),
        formTitle: form.title,
        formId: form.id,
        submittedAt: form.submittedAt || new Date(),
        formUrl: this.buildFormUrl(form.id),
      };

      await this.mailerService.sendMail({
        to: recipient.email,
        subject: `📋 Nuevo formulario para revisar: ${data.formType}`,
        template: "form-submitted",
        context: data,
      });

      this.logger.log(
        `Email enviado a ${recipient.email}: Formulario ${form.id} enviado para revisión`
      );
    } catch (error) {
      this.logger.error(
        `Error enviando email a ${recipient.email}:`,
        error.stack
      );
      // No lanzamos error para que no afecte el flujo principal
    }
  }

  /**
   * Enviar email cuando un formulario es aprobado
   */
  async sendFormApprovedEmail(
    recipient: User,
    form: BaseForm,
    approver: User
  ): Promise<void> {
    if (!envs.MAIL_ENABLED) {
      this.logger.debug("Email deshabilitado por configuración");
      return;
    }

    try {
      const data: FormApprovedEmailData = {
        recipientName: this.getUserDisplayName(recipient),
        approverName: this.getUserDisplayName(approver),
        formType: this.getFormTypeLabel(form.type),
        formTitle: form.title,
        formId: form.id,
        approvedAt: form.approvedAt || new Date(),
        formUrl: this.buildFormUrl(form.id),
        pdfUrl: form.pdfPath ? this.buildPdfUrl(form.pdfPath) : undefined,
      };

      await this.mailerService.sendMail({
        to: recipient.email,
        subject: `✅ Formulario aprobado: ${data.formType}`,
        template: "form-approved",
        context: data,
      });

      this.logger.log(
        `Email enviado a ${recipient.email}: Formulario ${form.id} aprobado`
      );
    } catch (error) {
      this.logger.error(
        `Error enviando email a ${recipient.email}:`,
        error.stack
      );
    }
  }

  /**
   * Enviar email cuando un formulario es rechazado
   */
  async sendFormRejectedEmail(
    recipient: User,
    form: BaseForm,
    rejector: User,
    reason: string
  ): Promise<void> {
    if (!envs.MAIL_ENABLED) {
      this.logger.debug("Email deshabilitado por configuración");
      return;
    }

    try {
      const data: FormRejectedEmailData = {
        recipientName: this.getUserDisplayName(recipient),
        rejectorName: this.getUserDisplayName(rejector),
        formType: this.getFormTypeLabel(form.type),
        formTitle: form.title,
        formId: form.id,
        rejectedAt: form.rejectedAt || new Date(),
        rejectionReason: reason,
        formUrl: this.buildFormUrl(form.id),
      };

      await this.mailerService.sendMail({
        to: recipient.email,
        subject: `❌ Formulario rechazado: ${data.formType}`,
        template: "form-rejected",
        context: data,
      });

      this.logger.log(
        `Email enviado a ${recipient.email}: Formulario ${form.id} rechazado`
      );
    } catch (error) {
      this.logger.error(
        `Error enviando email a ${recipient.email}:`,
        error.stack
      );
    }
  }

  /**
   * Enviar email cuando un formulario es editado por el director
   */
  async sendFormEditedEmail(
    recipient: User,
    form: BaseForm,
    editor: User,
    changes?: string
  ): Promise<void> {
    if (!envs.MAIL_ENABLED) {
      this.logger.debug("Email deshabilitado por configuración");
      return;
    }

    try {
      const data: FormEditedEmailData = {
        recipientName: this.getUserDisplayName(recipient),
        editorName: this.getUserDisplayName(editor),
        formType: this.getFormTypeLabel(form.type),
        formTitle: form.title,
        formId: form.id,
        editedAt: new Date(),
        formUrl: this.buildFormUrl(form.id),
        changes,
      };

      await this.mailerService.sendMail({
        to: recipient.email,
        subject: `✏️ Formulario editado: ${data.formType}`,
        template: "form-edited",
        context: data,
      });

      this.logger.log(
        `Email enviado a ${recipient.email}: Formulario ${form.id} editado`
      );
    } catch (error) {
      this.logger.error(
        `Error enviando email a ${recipient.email}:`,
        error.stack
      );
    }
  }

  /**
   * Enviar email de bienvenida a nuevo usuario
   */
  async sendWelcomeEmail(user: User): Promise<void> {
    if (!envs.MAIL_ENABLED) {
      this.logger.debug("Email deshabilitado por configuración");
      return;
    }

    try {
      const data: WelcomeEmailData = {
        recipientName: this.getUserDisplayName(user),
        username: user.email,
        role: user.role,
        loginUrl: `${envs.FRONTEND_URL}/login`,
      };

      await this.mailerService.sendMail({
        to: user.email,
        subject: "🎉 Bienvenido a Andamiaje API",
        template: "welcome",
        context: data,
      });

      this.logger.log(`Email de bienvenida enviado a ${user.email}`);
    } catch (error) {
      this.logger.error(
        `Error enviando email de bienvenida a ${user.email}:`,
        error.stack
      );
    }
  }

  /**
   * Enviar email de cambio de contraseña
   */
  async sendPasswordChangedEmail(user: User): Promise<void> {
    if (!envs.MAIL_ENABLED) {
      this.logger.debug("Email deshabilitado por configuración");
      return;
    }

    try {
      const data: PasswordChangedEmailData = {
        recipientName: this.getUserDisplayName(user),
        changedAt: new Date(),
        supportUrl: `${envs.FRONTEND_URL}/support`,
      };

      await this.mailerService.sendMail({
        to: user.email,
        subject: "🔒 Contraseña actualizada",
        template: "password-changed",
        context: data,
      });

      this.logger.log(`Email de cambio de contraseña enviado a ${user.email}`);
    } catch (error) {
      this.logger.error(
        `Error enviando email de cambio de contraseña a ${user.email}:`,
        error.stack
      );
    }
  }

  /**
   * Enviar email personalizado
   */
  async sendCustomEmail(
    to: string,
    subject: string,
    template: string,
    context: any
  ): Promise<void> {
    if (!envs.MAIL_ENABLED) {
      this.logger.debug("Email deshabilitado por configuración");
      return;
    }

    try {
      await this.mailerService.sendMail({
        to,
        subject,
        template,
        context,
      });

      this.logger.log(`Email personalizado enviado a ${to}: ${subject}`);
    } catch (error) {
      this.logger.error(
        `Error enviando email personalizado a ${to}:`,
        error.stack
      );
    }
  }

  // ============================================
  // MÉTODOS AUXILIARES
  // ============================================

  /**
   * Obtener nombre completo del usuario para mostrar
   */
  private getUserDisplayName(user: User): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email;
  }

  /**
   * Obtener etiqueta legible del tipo de formulario
   */
  private getFormTypeLabel(type: FORMTYPE): string {
    const labels: Record<FORMTYPE, string> = {
      [FORMTYPE.ACTAS]: "Acta de Reunión",
      [FORMTYPE.INFORME_ADMISION]: "Informe de Admisión",
      [FORMTYPE.PLAN_TRABAJO]: "Plan de Trabajo",
      [FORMTYPE.INFORME_SEMESTRAL]: "Informe Semestral",
      [FORMTYPE.REPORTE_MENSUAL]: "Reporte Mensual",
      [FORMTYPE.SEGUIMIENTO_ACOMPANANTE]: "Seguimiento Acompañante",
      [FORMTYPE.SEGUIMIENTO_FAMILIA]: "Seguimiento Familiar",
      [FORMTYPE.FACTURA]: "Factura",
    };
    return labels[type] || type;
  }

  /**
   * Construir URL del formulario en el frontend
   */
  private buildFormUrl(formId: string): string {
    return `${envs.FRONTEND_URL}/forms/${formId}`;
  }

  /**
   * Construir URL del PDF generado
   */
  private buildPdfUrl(pdfPath: string): string {
    // Si el pdfPath es relativo, construir la URL completa
    if (pdfPath.startsWith("http")) {
      return pdfPath;
    }
    // Asumimos que los PDFs están servidos desde el backend
    return `${envs.FRONTEND_URL}/api/v1/pdfs/${pdfPath}`;
  }
}
