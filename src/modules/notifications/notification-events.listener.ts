import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { NotificationEventBus } from "./notification-event-bus.service";
import {
  FormReviewedPayload,
  NewUserRegistrationPayload,
  NOTIFICATION_EVENTS,
  UserApprovedPayload,
} from "./notifications.events";
import {
  NotificationProvider,
  NOTIFICATION_PROVIDER,
} from "./providers/notification-provider.interface";

@Injectable()
export class NotificationEventsListener
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(NotificationEventsListener.name);

  constructor(
    private readonly eventBus: NotificationEventBus,
    @Inject(NOTIFICATION_PROVIDER)
    private readonly provider: NotificationProvider,
  ) {}

  private readonly onUserRegistrationRequested = async (
    payload: NewUserRegistrationPayload,
  ) => {
    try {
      await this.provider.send({
        type: "NEW_USER_REGISTRATION",
        recipientEmails: payload.recipientEmails,
        data: {
          userId: payload.userId,
          fullName: payload.fullName,
          documentNumber: payload.documentNumber,
          email: payload.email,
        },
      });
    } catch (error) {
      this.logger.error("Error enviando notificacion de registro", error);
    }
  };

  private readonly onUserApproved = async (payload: UserApprovedPayload) => {
    try {
      await this.provider.send({
        type: "WELCOME_APPROVED_USER",
        recipientEmail: payload.recipientEmail,
        data: {
          userId: payload.userId,
          fullName: payload.fullName,
          role: payload.role,
        },
      });
    } catch (error) {
      this.logger.error("Error enviando notificacion de aprobacion", error);
    }
  };

  private readonly onFormReviewed = async (payload: FormReviewedPayload) => {
    try {
      await this.provider.send({
        type: payload.approved ? "FORM_APPROVED" : "FORM_REJECTED",
        recipientEmail: payload.recipientEmail,
        data: {
          formId: payload.formId,
          formType: payload.formType,
          approved: payload.approved,
          rejectionReason: payload.rejectionReason,
          fileUrl: payload.fileUrl,
          reviewerId: payload.reviewerId,
        },
      });
    } catch (error) {
      this.logger.error("Error enviando notificacion de revision", error);
    }
  };

  onModuleInit() {
    this.eventBus.on(
      NOTIFICATION_EVENTS.USER_REGISTRATION_REQUESTED,
      this.onUserRegistrationRequested,
    );
    this.eventBus.on(NOTIFICATION_EVENTS.USER_APPROVED, this.onUserApproved);
    this.eventBus.on(NOTIFICATION_EVENTS.FORM_REVIEWED, this.onFormReviewed);
  }

  onModuleDestroy() {
    this.eventBus.off(
      NOTIFICATION_EVENTS.USER_REGISTRATION_REQUESTED,
      this.onUserRegistrationRequested,
    );
    this.eventBus.off(NOTIFICATION_EVENTS.USER_APPROVED, this.onUserApproved);
    this.eventBus.off(NOTIFICATION_EVENTS.FORM_REVIEWED, this.onFormReviewed);
  }
}
