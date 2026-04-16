import { Injectable, Logger } from "@nestjs/common";
import { User } from "@/entities";
import { NotificationEventBus } from "./notification-event-bus.service";
import { NOTIFICATION_EVENTS } from "./notifications.events";

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly eventBus: NotificationEventBus) {}

  async notifyDirectorsNewRegistration(
    directors: User[],
    pendingUser: User,
  ): Promise<void> {
    if (!directors.length) {
      this.logger.warn(
        `No hay directores para notificar sobre solicitud #${pendingUser.id}`,
      );
      return;
    }

    this.eventBus.emit(NOTIFICATION_EVENTS.USER_REGISTRATION_REQUESTED, {
      userId: pendingUser.id,
      fullName: pendingUser.fullName,
      documentNumber: pendingUser.documentNumber,
      email: pendingUser.email,
      recipientEmails: directors.map((director) => director.email),
    });
  }

  async sendWelcomeEmail(user: User): Promise<void> {
    this.eventBus.emit(NOTIFICATION_EVENTS.USER_APPROVED, {
      userId: user.id,
      fullName: user.fullName,
      role: user.role,
      recipientEmail: user.email,
    });
  }

  async notifyFormReviewed(payload: {
    formId: number;
    formType: string;
    approved: boolean;
    rejectionReason: string | null;
    fileUrl: string | null;
    reviewerId: number;
    recipientEmail: string;
  }): Promise<void> {
    this.eventBus.emit(NOTIFICATION_EVENTS.FORM_REVIEWED, payload);
  }
}
