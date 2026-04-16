import { Module } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { NotificationEventBus } from "./notification-event-bus.service";
import { NotificationEventsListener } from "./notification-events.listener";
import { LogNotificationProvider } from "./providers/log-notification.provider";
import { NOTIFICATION_PROVIDER } from "./providers/notification-provider.interface";

@Module({
  providers: [
    NotificationsService,
    NotificationEventBus,
    NotificationEventsListener,
    LogNotificationProvider,
    {
      provide: NOTIFICATION_PROVIDER,
      useExisting: LogNotificationProvider,
    },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
