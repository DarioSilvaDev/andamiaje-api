import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FormNotification, User } from "@/entities";
import { NotificationStatus, NotificationType } from "@/commons/enums";

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(FormNotification)
    private readonly notificationRepository: Repository<FormNotification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  /**
   * Obtiene notificaciones de un usuario
   */
  async getUserNotifications(
    userId: number,
    status?: NotificationStatus,
    limit: number = 50,
    offset: number = 0
  ): Promise<{
    notifications: FormNotification[];
    total: number;
    unreadCount: number;
  }> {
    const where: any = { recipient: { id: userId } };
    if (status) {
      where.status = status;
    }

    const [notifications, total] =
      await this.notificationRepository.findAndCount({
        where,
        relations: ["form", "sender", "form.createdBy"],
        order: { createdAt: "DESC" },
        take: limit,
        skip: offset,
      });

    // Contar notificaciones no leídas
    const unreadCount = await this.notificationRepository.count({
      where: {
        recipient: { id: userId },
        status: NotificationStatus.UNREAD,
      },
    });

    return { notifications, total, unreadCount };
  }

  /**
   * Marca una notificación como leída
   */
  async markAsRead(
    notificationId: string,
    userId: number
  ): Promise<FormNotification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, recipient: { id: userId } },
    });

    if (!notification) {
      throw new Error("Notificación no encontrada");
    }

    notification.markAsRead();
    return this.notificationRepository.save(notification);
  }

  /**
   * Marca todas las notificaciones de un usuario como leídas
   */
  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository.update(
      {
        recipient: { id: userId },
        status: NotificationStatus.UNREAD,
      },
      {
        status: NotificationStatus.READ,
        readAt: new Date(),
      }
    );
  }

  /**
   * Archiva una notificación
   */
  async archiveNotification(
    notificationId: string,
    userId: number
  ): Promise<FormNotification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, recipient: { id: userId } },
    });

    if (!notification) {
      throw new Error("Notificación no encontrada");
    }

    notification.archive();
    return this.notificationRepository.save(notification);
  }

  /**
   * Obtiene estadísticas de notificaciones
   */
  async getNotificationStats(userId: number): Promise<{
    total: number;
    unread: number;
    read: number;
    archived: number;
    byType: Record<NotificationType, number>;
  }> {
    const [total, unread, read, archived, byTypeRaw] = await Promise.all([
      this.notificationRepository.count({
        where: { recipient: { id: userId } },
      }),
      this.notificationRepository.count({
        where: { recipient: { id: userId }, status: NotificationStatus.UNREAD },
      }),
      this.notificationRepository.count({
        where: { recipient: { id: userId }, status: NotificationStatus.READ },
      }),
      this.notificationRepository.count({
        where: {
          recipient: { id: userId },
          status: NotificationStatus.ARCHIVED,
        },
      }),
      this.notificationRepository
        .createQueryBuilder("notification")
        .select("notification.type", "type")
        .addSelect("COUNT(*)", "count")
        .where("notification.recipient.id = :userId", { userId })
        .groupBy("notification.type")
        .getRawMany(),
    ]);

    const byType = byTypeRaw.reduce(
      (acc, item) => {
        acc[item.type] = parseInt(item.count);
        return acc;
      },
      {} as Record<NotificationType, number>
    );

    return { total, unread, read, archived, byType };
  }

  /**
   * Limpia notificaciones antiguas (más de 30 días)
   */
  async cleanupOldNotifications(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.notificationRepository
      .createQueryBuilder()
      .delete()
      .where("created_at < :date", { date: thirtyDaysAgo })
      .andWhere("status = :status", { status: NotificationStatus.READ })
      .execute();

    return result.affected || 0;
  }

  /**
   * Crea una notificación personalizada
   */
  async createCustomNotification(
    formId: string,
    senderId: number,
    recipientId: number,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, any>
  ): Promise<FormNotification> {
    const [form, sender, recipient] = await Promise.all([
      this.notificationRepository.manager.getRepository("BaseForm").findOne({
        where: { id: formId },
      }),
      this.userRepository.findOne({ where: { id: senderId } }),
      this.userRepository.findOne({ where: { id: recipientId } }),
    ]);

    if (!form || !sender || !recipient) {
      throw new Error("Formulario, remitente o destinatario no encontrado");
    }

    const notification = FormNotification.createNotification(
      form as any,
      sender,
      recipient,
      type,
      title,
      message,
      metadata
    );

    return this.notificationRepository.save(notification);
  }

  /**
   * Obtiene notificaciones recientes (últimas 24 horas)
   */
  async getRecentNotifications(
    userId: number,
    hours: number = 24
  ): Promise<FormNotification[]> {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);

    return this.notificationRepository.find({
      where: {
        recipient: { id: userId },
        createdAt: { $gte: cutoffDate } as any, // TypeORM syntax
      },
      relations: ["form", "sender"],
      order: { createdAt: "DESC" },
      take: 20,
    });
  }

  /**
   * Obtiene notificaciones por tipo
   */
  async getNotificationsByType(
    userId: number,
    type: NotificationType,
    limit: number = 20
  ): Promise<FormNotification[]> {
    return this.notificationRepository.find({
      where: {
        recipient: { id: userId },
        type,
      },
      relations: ["form", "sender"],
      order: { createdAt: "DESC" },
      take: limit,
    });
  }

  /**
   * Obtiene notificaciones relacionadas con un formulario específico
   */
  async getFormNotifications(
    formId: string,
    userId: number
  ): Promise<FormNotification[]> {
    return this.notificationRepository.find({
      where: {
        form: { id: formId },
        recipient: { id: userId },
      },
      relations: ["sender"],
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Elimina notificaciones de un formulario específico
   */
  async deleteFormNotifications(formId: string): Promise<number> {
    const result = await this.notificationRepository
      .createQueryBuilder()
      .delete()
      .where("form.id = :formId", { formId })
      .execute();

    return result.affected || 0;
  }
}
