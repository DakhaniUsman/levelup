import * as webpush from "web-push";
import { Types } from "mongoose";
import dbConnect from "@/lib/db";
import DeviceSubscription, { IDeviceSubscription } from "@/models/DeviceSubscription";

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
}

export class PushService {
  private static isConfigured = false;

  private static configureVapid() {
    if (this.isConfigured) return;

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT || "mailto:system@levelup.local";

    if (!publicKey || !privateKey) {
      console.warn("VAPID keys not configured in environment variables. Web Push will not dispatch.");
      return;
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);
    this.isConfigured = true;
  }

  static getVapidPublicKey(): string {
    return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
  }

  /**
   * Registers or updates a device subscription for the user
   */
  static async registerSubscription(
    userId: string | Types.ObjectId,
    subscription: {
      endpoint: string;
      keys: {
        p256dh: string;
        auth: string;
      };
    },
    userAgent?: string,
    deviceLabel?: string
  ): Promise<IDeviceSubscription> {
    await dbConnect();
    const userObjId = typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const device = await DeviceSubscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      {
        userId: userObjId,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        userAgent: userAgent || "",
        deviceLabel: deviceLabel || "Browser Device",
        isActive: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return device;
  }

  /**
   * Deactivates a device subscription
   */
  static async unregisterSubscription(
    userId: string | Types.ObjectId,
    endpoint: string
  ): Promise<boolean> {
    await dbConnect();
    const userObjId = typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const result = await DeviceSubscription.updateOne(
      { userId: userObjId, endpoint },
      { $set: { isActive: false } }
    );

    return result.modifiedCount > 0;
  }

  /**
   * Retrieves all active subscriptions for a user
   */
  static async getActiveSubscriptions(userId: string | Types.ObjectId): Promise<IDeviceSubscription[]> {
    await dbConnect();
    const userObjId = typeof userId === "string" ? new Types.ObjectId(userId) : userId;
    return DeviceSubscription.find({ userId: userObjId, isActive: true }).lean();
  }

  /**
   * Sends a Web Push payload to all active registered devices of a user
   */
  static async sendPushToUser(
    userId: string | Types.ObjectId,
    payload: PushPayload
  ): Promise<{ successful: number; failed: number; total: number }> {
    this.configureVapid();
    await dbConnect();

    const userObjId = typeof userId === "string" ? new Types.ObjectId(userId) : userId;
    const subscriptions = await DeviceSubscription.find({ userId: userObjId, isActive: true });

    if (!subscriptions || subscriptions.length === 0) {
      return { successful: 0, failed: 0, total: 0 };
    }

    const jsonPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || "/swords.jpg",
      badge: payload.badge || "/favicon.ico",
      url: payload.url || "/dashboard",
      tag: payload.tag || "levelup-" + Date.now(),
    });

    let successful = 0;
    let failed = 0;

    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.keys.p256dh,
                auth: sub.keys.auth,
              },
            },
            jsonPayload
          );
          successful++;
        } catch (error: any) {
          failed++;
          // If subscription has expired, gone, or is invalid, deactivate it
          if (error.statusCode === 410 || error.statusCode === 404) {
            console.warn(`Pruning inactive push subscription for user ${userId}: ${sub.endpoint}`);
            await DeviceSubscription.updateOne(
              { _id: sub._id },
              { $set: { isActive: false } }
            );
          } else {
            console.error(`Failed to send web push to ${sub.endpoint}:`, error.message);
          }
        }
      })
    );

    return { successful, failed, total: subscriptions.length };
  }
}

