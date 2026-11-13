import { Types } from "mongoose";
import dbConnect from "@/lib/db";
import Bookmark, { IBookmark, BookmarkCategory } from "@/models/Bookmark";
import {
  CreateBookmarkInput,
  UpdateBookmarkInput,
} from "../schemas/knowledge.schema";

export interface BookmarkFilterParams {
  userId: string | Types.ObjectId;
  category?: BookmarkCategory;
  isFavorite?: boolean;
  search?: string;
  tag?: string;
}

export class KnowledgeService {
  static async createBookmark(
    userId: string | Types.ObjectId,
    input: CreateBookmarkInput
  ): Promise<IBookmark> {
    await dbConnect();

    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const bookmark = await Bookmark.create({
      userId: userObjId,
      title: input.title.trim(),
      url: input.url.trim(),
      description: input.description?.trim() || "",
      notes: input.notes?.trim() || "",
      category: input.category,
      tags: (input.tags || []).map((t) => t.trim().toLowerCase()).filter(Boolean),
      isFavorite: input.isFavorite || false,
      isArchived: false,
    });

    return bookmark;
  }

  static async getBookmarks(
    params: BookmarkFilterParams
  ): Promise<IBookmark[]> {
    await dbConnect();

    const userObjId =
      typeof params.userId === "string"
        ? new Types.ObjectId(params.userId)
        : params.userId;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {
      userId: userObjId,
      isArchived: false,
    };

    if (params.category) filter.category = params.category;
    if (params.isFavorite !== undefined) filter.isFavorite = params.isFavorite;
    if (params.tag) filter.tags = params.tag.toLowerCase();

    if (params.search) {
      filter.$or = [
        { title: { $regex: params.search, $options: "i" } },
        { description: { $regex: params.search, $options: "i" } },
        { notes: { $regex: params.search, $options: "i" } },
        { tags: { $regex: params.search, $options: "i" } },
      ];
    }

    return Bookmark.find(filter).sort({ createdAt: -1 }).lean();
  }

  static async updateBookmark(
    bookmarkId: string,
    userId: string | Types.ObjectId,
    input: UpdateBookmarkInput
  ): Promise<IBookmark> {
    await dbConnect();

    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const bookmark = await Bookmark.findOne({
      _id: bookmarkId,
      userId: userObjId,
    });

    if (!bookmark) {
      throw new Error("Bookmark not found or access denied.");
    }

    if (input.title !== undefined) bookmark.title = input.title.trim();
    if (input.url !== undefined) bookmark.url = input.url.trim();
    if (input.description !== undefined) bookmark.description = input.description.trim();
    if (input.notes !== undefined) bookmark.notes = input.notes.trim();
    if (input.category !== undefined) bookmark.category = input.category;
    if (input.isFavorite !== undefined) bookmark.isFavorite = input.isFavorite;
    if (input.isArchived !== undefined) bookmark.isArchived = input.isArchived;
    if (input.tags !== undefined) {
      bookmark.tags = input.tags.map((t) => t.trim().toLowerCase()).filter(Boolean);
    }

    await bookmark.save();
    return bookmark;
  }

  static async deleteBookmark(
    bookmarkId: string,
    userId: string | Types.ObjectId
  ): Promise<boolean> {
    await dbConnect();

    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const res = await Bookmark.deleteOne({
      _id: bookmarkId,
      userId: userObjId,
    });

    return res.deletedCount > 0;
  }
}

