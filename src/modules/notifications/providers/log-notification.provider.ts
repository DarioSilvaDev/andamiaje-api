import { Injectable, Logger } from "@nestjs/common";
import {
  NotificationEnvelope,
  NotificationProvider,
} from "./notification-provider.interface";

@Injectable()
export class LogNotificationProvider implements NotificationProvider {
  private readonly logger = new Logger(LogNotificationProvider.name);

  async send(envelope: NotificationEnvelope): Promise<void> {
    this.logger.log(`Notification queued ${JSON.stringify(envelope)}`);
  }
}
