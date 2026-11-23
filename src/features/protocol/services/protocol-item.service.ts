import { Types } from "mongoose";
import dbConnect from "@/lib/db";
import ProtocolItem, {
  IProtocolItem,
  ProtocolSphere,
  ProtocolItemType,
} from "@/models/ProtocolItem";
import DailyProtocol from "@/models/DailyProtocol";
import {
  CreateProtocolItemInput,
  UpdateProtocolItemInput,
} from "../schemas/protocol-item.schema";

export const DEFAULT_INITIAL_ITEMS: Array<{
  sphere: ProtocolSphere;
  title: string;
  description: string;
  type: ProtocolItemType;
  order: number;
}> = [
  // 1. Spirituality
  {
    sphere: "SPIRITUALITY",
    title: "5 Daily Prayers",
    description: "Fajr, Dhuhr, Asr, Maghrib, Isha",
    type: "PRAYER_TRACKER",
    order: 1,
  },
  {
    sphere: "SPIRITUALITY",
    title: "Quran Recitation",
    description: "Recitation and reflection",
    type: "CHECKBOX",
    order: 2,
  },
  {
    sphere: "SPIRITUALITY",
    title: "Learning Arabic",
    description: "Language learning and grammar study",
    type: "CHECKBOX",
    order: 3,
  },

  // 2. Mental
  {
    sphere: "MENTAL",
    title: "Day Planning & Strategy",
    description: "Framed priorities before 10:30 AM",
    type: "CHECKBOX",
    order: 1,
  },
  {
    sphere: "MENTAL",
    title: "Read 10 Pages",
    description: "Book, philosophy, or technical text",
    type: "CHECKBOX",
    order: 2,
  },
  {
    sphere: "MENTAL",
    title: "Self-Learning & Research",
    description: "Coding practice or business growth",
    type: "CHECKBOX",
    order: 3,
  },

  // 3. Physical
  {
    sphere: "PHYSICAL",
    title: "Morning Light Workout & Walk",
    description: "Energize metabolism with light activity",
    type: "CHECKBOX",
    order: 1,
  },
  {
    sphere: "PHYSICAL",
    title: "Nutritious Breakfast",
    description: "High protein, wholesome start to day",
    type: "CHECKBOX",
    order: 2,
  },
  {
    sphere: "PHYSICAL",
    title: "Healthy Lunch (2:00 PM)",
    description: "Nutritious meal with focus",
    type: "CHECKBOX",
    order: 3,
  },
  {
    sphere: "PHYSICAL",
    title: "Evening Gym (7:30-8:00 PM)",
    description: "Progressive overload session with logged sets",
    type: "WORKOUT_LOG",
    order: 4,
  },
  {
    sphere: "PHYSICAL",
    title: "Sleep 7-9h (In bed by 11 PM)",
    description: "Optimal cellular recovery and restorative rest",
    type: "CHECKBOX",
    order: 5,
  },
  {
    sphere: "PHYSICAL",
    title: "Daily Steps Target (5,000 steps)",
    description: "Daily physical cardiovascular activity: 5,000 steps",
    type: "STEPS_TRACKER",
    order: 6,
  },

  // 4. Emotional
  {
    sphere: "EMOTIONAL",
    title: "Emotional Preparedness",
    description: "Calm responses to daily scenarios",
    type: "CHECKBOX",
    order: 1,
  },
  {
    sphere: "EMOTIONAL",
    title: "Focus & Planning for Mushfa",
    description: "Dedicated loving focus & future plans",
    type: "CHECKBOX",
    order: 2,
  },
  {
    sphere: "EMOTIONAL",
    title: "Family & Loved Ones",
    description: "Quality conversation & bonds",
    type: "CHECKBOX",
    order: 3,
  },

  // 5. Financial
  {
    sphere: "FINANCIAL",
    title: "End-of-Day Financial Audit",
    description: "Logged and accounted for every rupee spent today",
    type: "FINANCIAL_AUDIT",
    order: 1,
  },
];

export class ProtocolItemService {
  /**
   * Auto-seed default 14 protocol items for any user if they don't have any items yet.
   */
  static async seedDefaultItemsIfNone(
    userId: string | Types.ObjectId
  ): Promise<IProtocolItem[]> {
    await dbConnect();
    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const existingCount = await ProtocolItem.countDocuments({
      userId: userObjId,
      isDeleted: false,
    });

    if (existingCount > 0) {
      return ProtocolItem.find({ userId: userObjId, isDeleted: false }).sort({
        sphere: 1,
        order: 1,
      });
    }

    const itemsToInsert = DEFAULT_INITIAL_ITEMS.map((item) => ({
      userId: userObjId,
      sphere: item.sphere,
      title: item.title,
      description: item.description,
      type: item.type,
      order: item.order,
      isActive: true,
      isDeleted: false,
    }));

    return ProtocolItem.insertMany(itemsToInsert) as unknown as Promise<IProtocolItem[]>;
  }

  /**
   * Retrieve all active and configured items for a user, sorted by sphere and order.
   */
  static async getItems(
    userId: string | Types.ObjectId,
    sphereFilter?: ProtocolSphere
  ): Promise<IProtocolItem[]> {
    await dbConnect();
    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    // Seed defaults if empty
    await this.seedDefaultItemsIfNone(userObjId);

    const query: Record<string, unknown> = {
      userId: userObjId,
      isDeleted: false,
    };

    if (sphereFilter) {
      query.sphere = sphereFilter;
    }

    return ProtocolItem.find(query).sort({ sphere: 1, order: 1 });
  }

  /**
   * Create a new custom protocol activity.
   */
  static async createItem(
    userId: string | Types.ObjectId,
    data: CreateProtocolItemInput,
    todayDateStr?: string
  ): Promise<IProtocolItem> {
    await dbConnect();
    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    // Determine order if not specified
    let order = data.order;
    if (order === undefined) {
      const lastItem = await ProtocolItem.findOne({
        userId: userObjId,
        sphere: data.sphere,
        isDeleted: false,
      }).sort({ order: -1 });
      order = lastItem ? lastItem.order + 1 : 1;
    }

    const newItem = await ProtocolItem.create({
      userId: userObjId,
      sphere: data.sphere,
      title: data.title,
      description: data.description || "",
      type: data.type || "CHECKBOX",
      order,
      isActive: data.isActive !== undefined ? data.isActive : true,
      isDeleted: false,
    });

    // If today's protocol already exists and item is active, append it to today's active snapshot
    if (todayDateStr && newItem.isActive) {
      const todayProtocol = await DailyProtocol.findOne({
        userId: userObjId,
        targetDate: todayDateStr,
      });

      if (todayProtocol) {
        const alreadyExists = todayProtocol.activities.some(
          (a) => a.itemId.toString() === newItem._id.toString()
        );

        if (!alreadyExists) {
          todayProtocol.activities.push({
            itemId: newItem._id as Types.ObjectId,
            sphere: newItem.sphere,
            type: newItem.type,
            title: newItem.title,
            description: newItem.description,
            order: newItem.order,
            isCompleted: false,
          });
          await todayProtocol.save();
        }
      }
    }

    return newItem;
  }

  /**
   * Update an existing activity definition.
   */
  static async updateItem(
    userId: string | Types.ObjectId,
    itemId: string | Types.ObjectId,
    data: UpdateProtocolItemInput
  ): Promise<IProtocolItem | null> {
    await dbConnect();
    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;
    const itemObjId =
      typeof itemId === "string" ? new Types.ObjectId(itemId) : itemId;

    const item = await ProtocolItem.findOne({
      _id: itemObjId,
      userId: userObjId,
      isDeleted: false,
    });

    if (!item) return null;

    if (data.title !== undefined) item.title = data.title;
    if (data.description !== undefined) item.description = data.description;
    if (data.sphere !== undefined) item.sphere = data.sphere;
    if (data.type !== undefined) item.type = data.type;
    if (data.order !== undefined) item.order = data.order;
    if (data.isActive !== undefined) item.isActive = data.isActive;

    await item.save();
    return item;
  }

  /**
   * Soft-delete an activity to preserve historical daily completion records.
   */
  static async deleteItem(
    userId: string | Types.ObjectId,
    itemId: string | Types.ObjectId
  ): Promise<boolean> {
    await dbConnect();
    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;
    const itemObjId =
      typeof itemId === "string" ? new Types.ObjectId(itemId) : itemId;

    const result = await ProtocolItem.updateOne(
      { _id: itemObjId, userId: userObjId },
      { $set: { isDeleted: true, isActive: false } }
    );

    return result.modifiedCount > 0;
  }

  /**
   * Bulk reorder items within a sphere.
   */
  static async reorderItems(
    userId: string | Types.ObjectId,
    items: Array<{ id: string; order: number }>
  ): Promise<boolean> {
    await dbConnect();
    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: {
          _id: new Types.ObjectId(item.id),
          userId: userObjId,
        },
        update: { $set: { order: item.order } },
      },
    }));

    if (bulkOps.length > 0) {
      await ProtocolItem.bulkWrite(bulkOps);
    }

    return true;
  }
}

