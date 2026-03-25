import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  ActaFormV2,
  BaseForm,
  FormAuditLog,
  FormNotification,
  User,
} from "@/entities";
import {
  DocumentStatus,
  AuditAction,
  NotificationType,
  UserRole,
} from "@/commons/enums";
import { EmailService } from "@/modules/email/email.service";
import { PdfService } from "@/modules/printer/pdf.service";

@Injectable()
export class WorkflowService {
  constructor(
    @InjectRepository(BaseForm)
    private readonly formRepository: Repository<BaseForm>,
    @InjectRepository(FormAuditLog)
    private readonly auditLogRepository: Repository<FormAuditLog>,
    @InjectRepository(FormNotification)
    private readonly notificationRepository: Repository<FormNotification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
    private readonly pdfService: PdfService
  ) {}

  /**
   * Envía un formulario para revisión
   */
  async submitForReview(formId: string, user: User): Promise<BaseForm> {
    const form = await this.getFormWithRelations(formId);

    // Validaciones de permisos
    if (!form.canBeEditedBy(user)) {
      throw new ForbiddenException(
        "No tienes permisos para enviar este formulario"
      );
    }

    if (
      form.status !== DocumentStatus.DRAFT &&
      form.status !== DocumentStatus.REJECTED
    ) {
      throw new BadRequestException(
        "El formulario no puede ser enviado en su estado actual"
      );
    }

    // Validar formulario específico
    if (form instanceof ActaFormV2) {
      await form.validate();
    }

    // Actualizar estado
    form.submitForReview();

    // Guardar cambios
    const savedForm = await this.formRepository.save(form);

    // Crear log de auditoría
    await this.createAuditLog(form, user, AuditAction.SUBMITTED, {
      previousStatus:
        form.status === DocumentStatus.REJECTED
          ? DocumentStatus.REJECTED
          : DocumentStatus.DRAFT,
      newStatus: DocumentStatus.PENDING_REVIEW,
    });

    // Notificar al director
    await this.notifyDirector(form, user, NotificationType.FORM_SUBMITTED);

    return savedForm;
  }

  /**
   * Aprueba un formulario
   */
  async approveForm(formId: string, director: User): Promise<BaseForm> {
    const form = await this.getFormWithRelations(formId);

    // Validaciones de permisos
    if (!form.canBeApprovedBy(director)) {
      throw new ForbiddenException(
        "No tienes permisos para aprobar este formulario"
      );
    }

    // Actualizar estado
    form.approve(director);

    // Guardar cambios
    const savedForm = await this.formRepository.save(form);

    // Crear log de auditoría
    await this.createAuditLog(form, director, AuditAction.APPROVED, {
      previousStatus: DocumentStatus.PENDING_REVIEW,
      newStatus: DocumentStatus.APPROVED,
    });

    // Notificar al propietario
    await this.notifyOwner(form, director, NotificationType.FORM_APPROVED);

    // Generar PDF del formulario aprobado (en segundo plano)
    this.generateFormPdf(savedForm, director).catch((error) => {
      console.error(`Error generando PDF para formulario ${formId}:`, error);
    });

    return savedForm;
  }

  /**
   * Genera PDF para un formulario aprobado
   */
  private async generateFormPdf(form: BaseForm, user: User): Promise<void> {
    try {
      // Generar PDF real usando PdfService
      const pdfPath = await this.pdfService.generateFormPdf(form);
      
      form.pdfGeneratedAt = new Date();
      form.pdfPath = pdfPath;

      await this.formRepository.save(form);

      // Registrar en auditoría
      await this.createAuditLog(form, user, AuditAction.PDF_GENERATED, {
        pdfPath: form.pdfPath,
      });
    } catch (error) {
      console.error("Error generando PDF:", error);
      // No lanzar error para no interrumpir el flujo de aprobación
    }
  }

  /**
   * Rechaza un formulario
   */
  async rejectForm(
    formId: string,
    director: User,
    reason: string
  ): Promise<BaseForm> {
    const form = await this.getFormWithRelations(formId);

    // Validaciones de permisos
    if (!form.canBeRejectedBy(director)) {
      throw new ForbiddenException(
        "No tienes permisos para rechazar este formulario"
      );
    }

    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException("La razón del rechazo es obligatoria");
    }

    // Actualizar estado
    form.reject(director, reason);

    // Guardar cambios
    const savedForm = await this.formRepository.save(form);

    // Crear log de auditoría
    await this.createAuditLog(form, director, AuditAction.REJECTED, {
      previousStatus: DocumentStatus.PENDING_REVIEW,
      newStatus: DocumentStatus.REJECTED,
      reason,
    });

    // Notificar al propietario
    await this.notifyOwner(form, director, NotificationType.FORM_REJECTED, {
      reason,
    });

    return savedForm;
  }

  /**
   * Edita un formulario (solo director puede editar formularios de otros)
   */
  async editForm(
    formId: string,
    user: User,
    updates: Partial<BaseForm>,
    createNewVersion: boolean = false
  ): Promise<BaseForm> {
    const form = await this.getFormWithRelations(formId);

    // Validaciones de permisos
    if (!form.canBeEditedBy(user)) {
      throw new ForbiddenException(
        "No tienes permisos para editar este formulario"
      );
    }

    // Si es el director editando formulario de otro usuario, crear nueva versión
    if (
      user.role === UserRole.DIRECTOR &&
      form.createdBy.id !== user.id &&
      createNewVersion
    ) {
      return await this.createNewVersion(form, user, updates);
    }

    // Guardar cambios anteriores para auditoría
    const previousData = { ...form };

    // Aplicar actualizaciones
    Object.assign(form, updates);
    form.markAsEdited(user);

    // Guardar cambios
    const savedForm = await this.formRepository.save(form);

    // Crear log de auditoría
    await this.createAuditLog(form, user, AuditAction.UPDATED, {
      changes: this.getChanges(previousData, form),
    });

    // Si el director editó formulario de otro usuario, notificar al propietario
    if (user.role === UserRole.DIRECTOR && form.createdBy.id !== user.id) {
      await this.notifyOwner(
        form,
        user,
        NotificationType.FORM_EDITED_BY_DIRECTOR
      );
    }

    return savedForm;
  }

  /**
   * Crea una nueva versión del formulario
   */
  private async createNewVersion(
    originalForm: BaseForm,
    user: User,
    updates: Partial<BaseForm>
  ): Promise<BaseForm> {
    // Crear nueva versión
    const newVersion = this.formRepository.create({
      ...originalForm,
      ...updates,
      id: undefined, // Nueva ID
      version: originalForm.version + 1,
      parentForm: originalForm,
      status: DocumentStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
      submittedAt: null,
      approvedAt: null,
      rejectedAt: null,
      rejectionReason: null,
    });

    // Guardar nueva versión
    const savedVersion = await this.formRepository.save(newVersion);

    // Crear log de auditoría
    await this.createAuditLog(savedVersion, user, AuditAction.VERSION_CREATED, {
      originalFormId: originalForm.id,
      version: savedVersion.version,
    });

    // Notificar al propietario original
    await this.notifyOwner(
      savedVersion,
      user,
      NotificationType.FORM_EDITED_BY_DIRECTOR,
      {
        version: savedVersion.version,
      }
    );

    return savedVersion;
  }

  /**
   * Obtiene formularios pendientes de revisión
   */
  async getPendingReviewForms(): Promise<BaseForm[]> {
    return this.formRepository.find({
      where: { status: DocumentStatus.PENDING_REVIEW },
      relations: ["createdBy", "approvedBy", "rejectedBy"],
      order: { submittedAt: "ASC" },
    });
  }

  /**
   * Obtiene formularios por usuario
   */
  async getFormsByUser(
    userId: number,
    status?: DocumentStatus
  ): Promise<BaseForm[]> {
    const where: any = { createdBy: { id: userId } };
    if (status) {
      where.status = status;
    }

    return this.formRepository.find({
      where,
      relations: ["approvedBy", "rejectedBy", "lastEditedBy"],
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Obtiene historial de un formulario
   */
  async getFormHistory(formId: string): Promise<FormAuditLog[]> {
    return this.auditLogRepository.find({
      where: { form: { id: formId } },
      relations: ["user"],
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Obtiene versiones de un formulario
   */
  async getFormVersions(formId: string): Promise<BaseForm[]> {
    return this.formRepository.find({
      where: [{ id: formId }, { parentForm: { id: formId } }],
      relations: ["createdBy", "approvedBy", "rejectedBy", "lastEditedBy"],
      order: { version: "DESC" },
    });
  }

  /**
   * Métodos privados de utilidad
   */
  private async getFormWithRelations(formId: string): Promise<BaseForm> {
    const form = await this.formRepository.findOne({
      where: { id: formId },
      relations: ["createdBy", "approvedBy", "rejectedBy", "lastEditedBy"],
    });

    if (!form) {
      throw new BadRequestException("Formulario no encontrado");
    }

    return form;
  }

  private async createAuditLog(
    form: BaseForm,
    user: User,
    action: AuditAction,
    metadata?: Record<string, any>
  ): Promise<FormAuditLog> {
    const log = FormAuditLog.createLog(form, user, action, metadata);
    return this.auditLogRepository.save(log);
  }

  private async notifyDirector(
    form: BaseForm,
    sender: User,
    type: NotificationType
  ): Promise<void> {
    const directors = await this.userRepository.find({
      where: { role: UserRole.DIRECTOR },
    });

    const notifications = directors.map((director) => {
      if (type === NotificationType.FORM_SUBMITTED) {
        return FormNotification.createFormSubmittedNotification(
          form,
          sender,
          director
        );
      }
      return FormNotification.createNotification(
        form,
        sender,
        director,
        type,
        `Formulario ${form.type}`,
        `El formulario "${form.title}" requiere tu atención.`
      );
    });

    await this.notificationRepository.save(notifications);

    // Enviar emails a los directores
    if (type === NotificationType.FORM_SUBMITTED) {
      for (const director of directors) {
        await this.emailService.sendFormSubmittedEmail(director, form, sender);
      }
    }
  }

  private async notifyOwner(
    form: BaseForm,
    sender: User,
    type: NotificationType,
    metadata?: Record<string, any>
  ): Promise<void> {
    let notification: FormNotification;

    switch (type) {
      case NotificationType.FORM_APPROVED:
        notification = FormNotification.createFormApprovedNotification(
          form,
          sender,
          form.createdBy
        );
        // Enviar email de aprobación
        await this.emailService.sendFormApprovedEmail(
          form.createdBy,
          form,
          sender
        );
        break;
      case NotificationType.FORM_REJECTED:
        notification = FormNotification.createFormRejectedNotification(
          form,
          sender,
          form.createdBy,
          metadata?.reason || "Sin razón especificada"
        );
        // Enviar email de rechazo
        await this.emailService.sendFormRejectedEmail(
          form.createdBy,
          form,
          sender,
          metadata?.reason || "Sin razón especificada"
        );
        break;
      case NotificationType.FORM_EDITED_BY_DIRECTOR:
        notification = FormNotification.createFormEditedNotification(
          form,
          sender,
          form.createdBy
        );
        // Enviar email de edición
        await this.emailService.sendFormEditedEmail(
          form.createdBy,
          form,
          sender,
          metadata?.changes
        );
        break;
      default:
        notification = FormNotification.createNotification(
          form,
          sender,
          form.createdBy,
          type,
          `Formulario ${form.type}`,
          `Tu formulario "${form.title}" ha sido actualizado.`
        );
    }

    await this.notificationRepository.save(notification);
  }

  private getChanges(previous: any, current: any): Record<string, any> {
    const changes: Record<string, any> = {};

    for (const key in current) {
      if (previous[key] !== current[key]) {
        changes[key] = {
          from: previous[key],
          to: current[key],
        };
      }
    }

    return changes;
  }
}
