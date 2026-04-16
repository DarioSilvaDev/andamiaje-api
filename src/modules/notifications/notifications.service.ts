import { Injectable, Logger } from "@nestjs/common";
import { User } from "@/entities";

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

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

    const payload = {
      type: "NEW_USER_REGISTRATION",
      recipientEmails: directors.map((director) => director.email),
      data: {
        userId: pendingUser.id,
        fullName: pendingUser.fullName,
        documentNumber: pendingUser.documentNumber,
        email: pendingUser.email,
      },
    };

    this.logger.log(`Email queued ${JSON.stringify(payload)}`);
  }

  async sendWelcomeEmail(user: User): Promise<void> {
    const payload = {
      type: "WELCOME_APPROVED_USER",
      recipientEmail: user.email,
      data: {
        userId: user.id,
        fullName: user.fullName,
        role: user.role,
      },
    };

    this.logger.log(`Email queued ${JSON.stringify(payload)}`);
  }
}
