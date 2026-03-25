import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  ValidationPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { WorkflowService } from "../services/workflow.service";
import { NotificationService } from "../services/notification.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { AuthRolesGuard } from "../../auth/guards/auth-roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { User, BaseForm, FormNotification } from "@/entities";
import { UserRole, DocumentStatus, NotificationStatus } from "@/commons/enums";
import { SubmitFormDto, RejectFormDto, EditFormDto } from "../dto/workflow.dto";

@ApiTags("Form Workflow")
@Controller("forms/workflow")
@UseGuards(JwtAuthGuard, AuthRolesGuard)
@ApiBearerAuth()
export class WorkflowController {
  constructor(
    private readonly workflowService: WorkflowService,
    private readonly notificationService: NotificationService
  ) {}

  /**
   * Enviar formulario para revisión
   */
  @Post(":id/submit")
  @ApiOperation({
    summary: "Enviar formulario para revisión",
    description:
      "Envía un formulario en estado DRAFT o REJECTED para revisión por el director",
  })
  @ApiParam({ name: "id", description: "ID del formulario", type: "string" })
  @ApiResponse({
    status: 200,
    description: "Formulario enviado correctamente",
    type: BaseForm,
  })
  @ApiResponse({
    status: 403,
    description: "Sin permisos para enviar el formulario",
  })
  @ApiResponse({ status: 400, description: "Formulario no puede ser enviado" })
  async submitForReview(
    @Param("id", ParseUUIDPipe) formId: string,
    @CurrentUser() user: User,
    @Body() submitDto: SubmitFormDto
  ): Promise<BaseForm> {
    return this.workflowService.submitForReview(formId, user);
  }

  /**
   * Aprobar formulario (solo director)
   */
  @Patch(":id/approve")
  @Roles(UserRole.DIRECTOR)
  @ApiOperation({
    summary: "Aprobar formulario",
    description:
      "Aprueba un formulario pendiente de revisión. Solo disponible para directores.",
  })
  @ApiParam({ name: "id", description: "ID del formulario", type: "string" })
  @ApiResponse({
    status: 200,
    description: "Formulario aprobado correctamente",
    type: BaseForm,
  })
  @ApiResponse({
    status: 403,
    description: "Solo los directores pueden aprobar formularios",
  })
  async approveForm(
    @Param("id", ParseUUIDPipe) formId: string,
    @CurrentUser() user: User
  ): Promise<BaseForm> {
    return this.workflowService.approveForm(formId, user);
  }

  /**
   * Rechazar formulario (solo director)
   */
  @Patch(":id/reject")
  @Roles(UserRole.DIRECTOR)
  @ApiOperation({
    summary: "Rechazar formulario",
    description:
      "Rechaza un formulario pendiente de revisión con una razón específica.",
  })
  @ApiParam({ name: "id", description: "ID del formulario", type: "string" })
  @ApiResponse({
    status: 200,
    description: "Formulario rechazado correctamente",
    type: BaseForm,
  })
  @ApiResponse({
    status: 403,
    description: "Solo los directores pueden rechazar formularios",
  })
  async rejectForm(
    @Param("id", ParseUUIDPipe) formId: string,
    @CurrentUser() user: User,
    @Body(ValidationPipe) rejectDto: RejectFormDto
  ): Promise<BaseForm> {
    return this.workflowService.rejectForm(formId, user, rejectDto.reason);
  }

  /**
   * Editar formulario
   */
  @Patch(":id/edit")
  @ApiOperation({
    summary: "Editar formulario",
    description:
      "Edita un formulario. Los directores pueden editar cualquier formulario.",
  })
  @ApiParam({ name: "id", description: "ID del formulario", type: "string" })
  @ApiResponse({
    status: 200,
    description: "Formulario editado correctamente",
    type: BaseForm,
  })
  @ApiResponse({
    status: 403,
    description: "Sin permisos para editar el formulario",
  })
  async editForm(
    @Param("id", ParseUUIDPipe) formId: string,
    @CurrentUser() user: User,
    @Body(ValidationPipe) editDto: EditFormDto
  ): Promise<BaseForm> {
    return this.workflowService.editForm(
      formId,
      user,
      editDto.updates,
      editDto.createNewVersion
    );
  }

  /**
   * Obtener formularios pendientes de revisión
   */
  @Get("pending")
  @Roles(UserRole.DIRECTOR)
  @ApiOperation({
    summary: "Obtener formularios pendientes",
    description:
      "Obtiene todos los formularios pendientes de revisión. Solo para directores.",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de formularios pendientes",
    type: [BaseForm],
  })
  async getPendingForms(@CurrentUser() user: User): Promise<BaseForm[]> {
    return this.workflowService.getPendingReviewForms();
  }

  /**
   * Obtener formularios del usuario
   */
  @Get("my-forms")
  @ApiOperation({
    summary: "Obtener mis formularios",
    description: "Obtiene los formularios creados por el usuario actual",
  })
  @ApiQuery({ name: "status", required: false, enum: DocumentStatus })
  @ApiResponse({
    status: 200,
    description: "Lista de formularios del usuario",
    type: [BaseForm],
  })
  async getMyForms(
    @CurrentUser() user: User,
    @Query("status") status?: DocumentStatus
  ): Promise<BaseForm[]> {
    return this.workflowService.getFormsByUser(user.id, status);
  }

  /**
   * Obtener historial de un formulario
   */
  @Get(":id/history")
  @ApiOperation({
    summary: "Obtener historial del formulario",
    description: "Obtiene el historial completo de cambios de un formulario",
  })
  @ApiParam({ name: "id", description: "ID del formulario", type: "string" })
  @ApiResponse({
    status: 200,
    description: "Historial del formulario",
  })
  async getFormHistory(
    @Param("id", ParseUUIDPipe) formId: string
  ): Promise<any[]> {
    return this.workflowService.getFormHistory(formId);
  }

  /**
   * Obtener versiones de un formulario
   */
  @Get(":id/versions")
  @ApiOperation({
    summary: "Obtener versiones del formulario",
    description: "Obtiene todas las versiones de un formulario",
  })
  @ApiParam({ name: "id", description: "ID del formulario", type: "string" })
  @ApiResponse({
    status: 200,
    description: "Versiones del formulario",
    type: [BaseForm],
  })
  async getFormVersions(
    @Param("id", ParseUUIDPipe) formId: string
  ): Promise<BaseForm[]> {
    return this.workflowService.getFormVersions(formId);
  }

  /**
   * Obtener notificaciones del usuario
   */
  @Get("notifications")
  @ApiOperation({
    summary: "Obtener notificaciones",
    description: "Obtiene las notificaciones del usuario actual",
  })
  @ApiQuery({ name: "status", required: false, enum: NotificationStatus })
  @ApiQuery({ name: "limit", required: false, type: "number" })
  @ApiQuery({ name: "offset", required: false, type: "number" })
  @ApiResponse({
    status: 200,
    description: "Notificaciones del usuario",
  })
  async getNotifications(
    @CurrentUser() user: User,
    @Query("status") status?: NotificationStatus,
    @Query("limit", ParseIntPipe) limit: number = 50,
    @Query("offset", ParseIntPipe) offset: number = 0
  ): Promise<{
    notifications: FormNotification[];
    total: number;
    unreadCount: number;
  }> {
    return this.notificationService.getUserNotifications(
      user.id,
      status,
      limit,
      offset
    );
  }

  /**
   * Marcar notificación como leída
   */
  @Patch("notifications/:id/read")
  @ApiOperation({
    summary: "Marcar notificación como leída",
    description: "Marca una notificación específica como leída",
  })
  @ApiParam({
    name: "id",
    description: "ID de la notificación",
    type: "string",
  })
  @ApiResponse({
    status: 200,
    description: "Notificación marcada como leída",
    type: FormNotification,
  })
  async markNotificationAsRead(
    @Param("id", ParseUUIDPipe) notificationId: string,
    @CurrentUser() user: User
  ): Promise<FormNotification> {
    return this.notificationService.markAsRead(notificationId, user.id);
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  @Patch("notifications/read-all")
  @ApiOperation({
    summary: "Marcar todas las notificaciones como leídas",
    description: "Marca todas las notificaciones del usuario como leídas",
  })
  @ApiResponse({
    status: 200,
    description: "Todas las notificaciones marcadas como leídas",
  })
  async markAllNotificationsAsRead(
    @CurrentUser() user: User
  ): Promise<{ message: string }> {
    await this.notificationService.markAllAsRead(user.id);
    return {
      message: "Todas las notificaciones han sido marcadas como leídas",
    };
  }

  /**
   * Obtener estadísticas de notificaciones
   */
  @Get("notifications/stats")
  @ApiOperation({
    summary: "Estadísticas de notificaciones",
    description: "Obtiene estadísticas de las notificaciones del usuario",
  })
  @ApiResponse({
    status: 200,
    description: "Estadísticas de notificaciones",
  })
  async getNotificationStats(@CurrentUser() user: User): Promise<any> {
    return this.notificationService.getNotificationStats(user.id);
  }
}
