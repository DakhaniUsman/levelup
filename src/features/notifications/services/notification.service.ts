import { Types } from "mongoose";
import dbConnect from "@/lib/db";
import Notification, {
  INotification,
  NotificationType,
} from "@/models/Notification";

export interface CreateNotificationParams {
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
}

export class NotificationService {
  static async createNotification(
    userId: string | Types.ObjectId,
    params: CreateNotificationParams
  ): Promise<INotification> {
    await dbConnect();
    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const notif = await Notification.create({
      userId: userObjId,
      title: params.title,
      message: params.message,
      type: params.type || "SYSTEM",
      link: params.link || "/dashboard",
      isRead: false,
    });

    return notif;
  }

  static async getNotifications(
    userId: string | Types.ObjectId,
    limit = 20
  ): Promise<{ notifications: INotification[]; unreadCount: number }> {
    await dbConnect();
    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ userId: userObjId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      Notification.countDocuments({ userId: userObjId, isRead: false }),
    ]);

    return {
      notifications: notifications as unknown as INotification[],
      unreadCount,
    };
  }

  static async markAsRead(
    notificationId: string,
    userId: string | Types.ObjectId
  ): Promise<boolean> {
    await dbConnect();
    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const res = await Notification.updateOne(
      { _id: notificationId, userId: userObjId },
      { $set: { isRead: true } }
    );
    return res.modifiedCount > 0;
  }

  static async markAllAsRead(
    userId: string | Types.ObjectId
  ): Promise<number> {
    await dbConnect();
    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const res = await Notification.updateMany(
      { userId: userObjId, isRead: false },
      { $set: { isRead: true } }
    );
    return res.modifiedCount;
  }
}

