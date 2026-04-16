export interface NotificationEnvelope {
  type: string;
  recipientEmail?: string;
  recipientEmails?: string[];
  data: Record<string, any>;
}

export interface NotificationProvider {
  send(envelope: NotificationEnvelope): Promise<void>;
}

export const NOTIFICATION_PROVIDER = Symbol("NOTIFICATION_PROVIDER");
